var Game = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function Game() {
    Phaser.Scene.call(this, { key: "game" });
  },

  init: function(data) {
    this.socket = data.socket;
    this.players = data.players;
  },

  preload: function() {},

  create: function() {
    var self = this;

    this.add.image(480, 300, "sky");

    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('terrain', 'terrain')
    this.platforms = map.createStaticLayer('TilemapLayer', tileset, 0, 0);
    this.platforms.setCollisionByExclusion(-1, true);

    cursors = this.input.keyboard.createCursorKeys();

    this.otherPlayers = this.physics.add.group();

    Object.keys(this.players).forEach(function(id) {
      if (self.players[id].playerID === self.socket.id) {
        self.addPlayer(self.players[id]);
      } else {
        self.addOtherPlayers(self.players[id]);
      }
    });

    this.socket.on("playerMoved", playerInfo => {
      self.otherPlayers.getChildren().forEach(otherPlayer => {
        if (playerInfo.playerID === otherPlayer.playerID) {
          otherPlayer.setPosition(playerInfo.x, playerInfo.y);
          otherPlayer.anims.play(
            playerInfo.spriteKey + "-" + playerInfo.direction,
            true
          );
        }
      });
    });

    this.socket.on("playerDied", data => {
      self.otherPlayers.getChildren().forEach(function(otherPlayer) {
        if (data.victimID === otherPlayer.playerID) {
          self.destroyPlayer(otherPlayer);
        }
        if (data.killerID === otherPlayer.playerID) {
          otherPlayer.setVelocityY(-400);
        }
      });
      if (self.player.playerID === data.killerID) {
        self.player.setVelocityY(-400);
      } else if (self.player.playerID === data.victimID) {
        self.destroyPlayer(self.player);
      }
    });

    this.socket.on("disconnect", function(playerID) {
      self.otherPlayers.getChildren().forEach(function(otherPlayer) {
        if (playerID === otherPlayer.playerID) {
          self.destroyPlayer(otherPlayer);
        }
      });
    });
  },

  update: function() {
    if (this.player && this.player.alive) {
      if (cursors.left.isDown) {
        this.player.setVelocityX(-200);
        if (this.player.body.velocity.y >= 0) {
          this.player.anims.play(this.player.spriteKey + "-left", true);
        }
        this.player.direction = "left";
      } else if (cursors.right.isDown) {
        this.player.setVelocityX(200);
        if (this.player.body.velocity.y >= 0) {
          this.player.anims.play(this.player.spriteKey + "-right", true);
        }
        this.player.direction = "right";
      } else if (
        this.player.direction &&
        this.player.direction === "double-jump" &&
        this.player.y > this.player.oldPosition.y
      ) {
        // Reset player's position when he is falling after a double-jump
        this.player.anims.play(
          this.player.spriteKey + "-" + this.player.directionBeforeJump
        );
        this.player.direction = this.player.directionBeforeJump;
      } else {
        this.player.setVelocityX(0);
        if (
          this.player.direction === "left" ||
          this.player.direction === "idle-left"
        ) {
          this.player.anims.play(this.player.spriteKey + "-idle-left", true);
          this.player.direction = "idle-left";
        } else if (
          this.player.direction === "right" ||
          this.player.direction === "idle-right"
        ) {
          this.player.anims.play(this.player.spriteKey + "-idle-right", true);
          this.player.direction = "idle-right";
        }
      }

      if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
        this.playerJump(this.player);
      }

      this.physics.world.wrap(this.player);

      var x = this.player.x;
      var y = this.player.y;
      if (
        this.player.oldPosition &&
        (x !== this.player.oldPosition.x || y != this.player.oldPosition.y)
      ) {
        this.socket.emit("playerMovement", {
          x: this.player.x,
          y: this.player.y,
          direction: this.player.direction
        });
      }

      this.player.oldPosition = {
        x: this.player.x,
        y: this.player.y
      };
    }
  },

  addPlayer: function(playerInfo) {
    this.player = this.physics.add.sprite(
      playerInfo.x,
      playerInfo.y,
      playerInfo.spriteKey + "-" + playerInfo.direction
    );
    this.player.setBounce(0);
    this.player.body.setGravityY(500);
    this.physics.add.collider(
      this.player,
      this.platforms,
      this.handlePlatformCollision,
      null,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.otherPlayers,
      this.handlePlayersOverlap,
      null,
      this
    );

    this.player.playerID = playerInfo.playerID;
    this.player.alive = true;
    this.player.direction = playerInfo.direction;
    this.player.spriteKey = playerInfo.spriteKey;
    this.player.jumpCount = 0;
  },

  addOtherPlayers: function(playerInfo) {
    const otherPlayer = this.physics.add.sprite(
      playerInfo.x,
      playerInfo.y,
      playerInfo.spriteKey + "-" + playerInfo.direction
    );
    otherPlayer.playerID = playerInfo.playerID;
    otherPlayer.setBounce(0);
    otherPlayer.body.setGravityY(500);
    this.physics.add.collider(otherPlayer, this.platforms);

    this.otherPlayers.add(otherPlayer);
  },

  handlePlayersOverlap: function(player, otherPlayer) {
    if (player.body.touching.right || player.body.touching.left) {
      //pass
    } else if (player.body.touching.down && otherPlayer.body.touching.up) {
      this.socket.emit("playerKilled", {
        killerID: player.playerID,
        victimID: otherPlayer.playerID
      });
    }
  },

  handlePlatformCollision: function(player, platform) {
    console.log("handle collision")
    if (player.body.blocked.down) {
      player.jumpCount = 0;
    }
  },

  destroyPlayer: function(player) {
    player.alive = false;
    player.destroy();
    // this.player.setActive(false).setVisible(false);

    killBoom = this.physics.add.sprite(player.x, player.y, "disappearing");
    killBoom.body.setAllowGravity(false);
    killBoom.on("animationcomplete", () => {
      killBoom.destroy();
    });
    killBoom.play("death");
  },

  playerJump: function() {
    if (this.player.jumpCount == 0) {
      this.firstJump();
    }
    if (this.player.jumpCount == 1 && !this.player.body.blocked.down) {
      this.secondJump();
    }
  },

  firstJump: function() {
    this.player.jumpCount++;
    this.player.setVelocityY(-500);
  },

  secondJump: function() {
    this.player.jumpCount++;
    this.player.directionBeforeJump = this.player.direction;
    this.player.direction = "double-jump";
    this.player.setVelocityY(-500);
    this.player.anims.play(this.player.spriteKey + "-double-jump", true);
  }
});
