var platforms;

var Game = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function Game() {
    Phaser.Scene.call(this, { key: "game" });
  },

  init: function(data) {
    console.log(data);
    this.socket = data.socket;
    // this.opponents = data.opponents;
    console.log("Socket: ", this.socket);
  },

  preload: function() {},

  create: function() {
    var self = this;
    // console.log("CurrentPlayers in game: ", this.opponents);

    // this.socket = io();
    // this.socket.emit("gameJoined");

    this.otherPlayers = this.physics.add.group();
    console.log("Socket: ", this.socket);
    // Object.keys(this.opponents).forEach(function(id) {
    //   if (self.opponents[id].playerID === self.socket.id) {
    //     self.addPlayer(self.opponents[id]);
    //   } else {
    //     self.addOtherPlayers(self.opponents[id]);
    //   }
    // });
    this.socket.on("currentPlayers", function(players) {
      Object.keys(players).forEach(function(id) {
        if (players[id].playerID === self.socket.id) {
          self.addPlayer(players[id]);
        } else {
          self.addOtherPlayers(players[id]);
        }
      });
    });

    this.socket.on("newPlayer", function(playerInfo) {
      self.addOtherPlayers(playerInfo);
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

    this.socket.on("opponentDied", data => {
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

    this.add.image(400, 300, "sky");

    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, "ground");
    //.setScale(2);
    // .refreshBody();
    platforms.create(600, 400, "ground");
    platforms.create(50, 250, "ground");
    platforms.create(750, 220, "ground");

    cursors = this.input.keyboard.createCursorKeys();
  },

  update: function() {
    if (this.player && this.player.alive) {
      if (cursors.left.isDown) {
        this.player.setVelocityX(-200);
        this.player.anims.play(this.player.spriteKey + "-left", true);
        this.player.direction = "left";
      } else if (cursors.right.isDown) {
        this.player.setVelocityX(200);
        this.player.anims.play(this.player.spriteKey + "-right", true);
        this.player.direction = "right";
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
    // this.player.setCollideWorldBounds(true);
    this.physics.add.collider(
      this.player,
      platforms,
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

    console.log("baiatul gigel created : ", this.player);
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
    otherPlayer.setCollideWorldBounds(true);
    this.physics.add.collider(otherPlayer, platforms);

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
    if (player.body.touching.down) {
      player.jumpCount = 0;
    }
  },

  destroyPlayer: function(player) {
    player.alive = false;
    player.destroy();

    killBoom = this.physics.add.sprite(player.x, player.y, "disappearing");
    killBoom.body.setAllowGravity(false);
    killBoom.on(
      "animationcomplete",
      () => {
        killBoom.destroy();
      },
      this
    );
    killBoom.play("death");
  },

  playerJump: function(player) {
    if (player.jumpCount == 0) {
      this.firstJump(player);
    }
    if (player.jumpCount == 1 && !player.body.touching.down) {
      this.secondJump(player);
    }
  },

  firstJump: function(player) {
    player.jumpCount++;
    player.setVelocityY(-500);
  },

  secondJump: function(player) {
    player.jumpCount++;
    player.setVelocityY(-500);
  }
});
