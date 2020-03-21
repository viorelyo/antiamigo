const avatarPositions = [560, 410, 260];

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

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, "ground");
    this.platforms.create(600, 400, "ground");
    this.platforms.create(50, 250, "ground");
    this.platforms.create(750, 220, "ground");

    cursors = this.input.keyboard.createCursorKeys();

    this.otherPlayers = this.physics.add.group();

    Object.keys(this.players).forEach(function(id) {
      if (self.players[id].playerID === self.socket.id) {
        self.addPlayer(self.players[id]);
      } else {
        self.addOtherPlayers(self.players[id]);
      }
    });

    this.drawScoreboard();

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
    // this.player.setCollideWorldBounds(true);
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
    // otherPlayer.setCollideWorldBounds(true);
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
    if (player.body.touching.down) {
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
    if (this.player.jumpCount == 1 && !this.player.body.touching.down) {
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
  },

  drawScoreboard: function() {
    var scoresPositions = avatarPositions;
    var graphics = this.add.graphics({
      lineStyle: { width: 2, color: 0xaa00aa }
    });

    var line1 = new Phaser.Geom.Line(960, 150, 1080, 150);
    var line2 = new Phaser.Geom.Line(960, 300, 1080, 300);
    var line3 = new Phaser.Geom.Line(960, 450, 1080, 450);

    graphics.strokeLineShape(line1);
    graphics.strokeLineShape(line2);
    graphics.strokeLineShape(line3);

    this.add.text(1000, 10, this.player.spriteKey, {
      fontSize: 20,
      color: "#e6ed00"
    });
    this.add.text(1010, 50, "9", {
      fontSize: 30,
      fontFamily: "Consolas"
    });
    this.add.image(1020, 110, this.player.spriteKey + "-avatar").setScale(0.8);

    for (var id in this.players) {
      if (id != this.player.playerID) {
        y = scoresPositions.pop();

        this.add.text(1000, y - 100, this.players[id].spriteKey, {
          fontSize: 20
        });
        this.add.text(1010, y - 60, "9", {
          fontSize: 30,
          fontFamily: "Consolas"
        });
        this.add
          .image(1020, y, this.players[id].spriteKey + "-avatar")
          .setScale(0.8);
      }
    }
  }
});

// var graphics = this.add.graphics({
//   lineStyle: { width: 2, color: 0xaa00aa }
// });
// var line1 = new Phaser.Geom.Line(960, 150, 1080, 150);
// var line2 = new Phaser.Geom.Line(960, 300, 1080, 300);
// var line3 = new Phaser.Geom.Line(960, 450, 1080, 450);

// graphics.strokeLineShape(line1);
// graphics.strokeLineShape(line2);
// graphics.strokeLineShape(line3);

// var nick = this.add.text(1000, 10, "guy", { fontSize: 20 });
// var score = this.add.text(1010, 50, "9", {
//   fontSize: 30,
//   fontFamily: "Consolas"
// });
// var avatar = this.add.image(1020, 110, "guy-avatar").setScale(0.8);
// var avatar = this.add.image(1020, 260, "guy-avatar").setScale(0.8);
