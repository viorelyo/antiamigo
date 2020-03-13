var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 700 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var client = {};

var game = new Phaser.Game(config);
var platforms;
const sprites = ["dude", "frog", "pink", "guy"];

function preload() {
  this.load.image("sky", "../assets/sky.png");
  this.load.image("ground", "../assets/platform.png");

  this.load.spritesheet("disappearing", "../assets/disappearing.png", {
    frameWidth: 96,
    frameHeight: 96
  });

  var self = this;
  sprites.forEach(sprite => {
    self.load.spritesheet(
      sprite + "-idle-left",
      "../assets/" + sprite + "-idle-left.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    self.load.spritesheet(
      sprite + "-idle-right",
      "../assets/" + sprite + "-idle-right.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    self.load.spritesheet(
      sprite + "-right",
      "../assets/" + sprite + "-right.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    self.load.spritesheet(
      sprite + "-left",
      "../assets/" + sprite + "-left.png",
      { frameWidth: 32, frameHeight: 32 }
    );
  });
}

function create() {
  var self = this;

  client.socket = io();

  this.otherPlayers = this.physics.add.group();

  client.socket.on("currentPlayers", function(players) {
    Object.keys(players).forEach(function(id) {
      if (players[id].playerID === client.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });

  client.socket.on("newPlayer", function(playerInfo) {
    addOtherPlayers(self, playerInfo);
  });

  client.socket.on("playerMoved", playerInfo => {
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

  client.socket.on("opponentDied", data => {
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (data.victimID === otherPlayer.playerID) {
        destroyPlayer(self, otherPlayer);
      }
      if (data.killerID === otherPlayer.playerID) {
        console.log("found the killer: " + otherPlayer.playerID);
        otherPlayer.setVelocityY(-400);
      }
    });
    if (self.player.playerID === data.killerID) {
      console.log("You are the killer");
      self.player.setVelocityY(-400);
    } else if (self.player.playerID === data.victimID) {
      console.log("You were killed");
      destroyPlayer(self, self.player);
    }
  });

  client.socket.on("disconnect", function(playerID) {
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (playerID === otherPlayer.playerID) {
        destroyPlayer(self, otherPlayer);
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

  this.anims.create({
    key: "death",
    frames: this.anims.generateFrameNumbers("disappearing", {
      start: 0,
      end: 6
    }),
    frameRate: 20,
    repeat: 1
  });

  sprites.forEach(sprite => {
    this.anims.create({
      key: sprite + "-left",
      frames: this.anims.generateFrameNumbers(sprite + "-left", {
        start: 0,
        end: 11
      }),
      frameRate: 30,
      repeat: -1
    });

    this.anims.create({
      key: sprite + "-idle-left",
      frames: this.anims.generateFrameNumbers(sprite + "-idle-left", {
        start: 0,
        end: 10
      }),
      frameRate: 30,
      repeat: -1
    });

    this.anims.create({
      key: sprite + "-idle-right",
      frames: this.anims.generateFrameNumbers(sprite + "-idle-right", {
        start: 0,
        end: 10
      }),
      frameRate: 30,
      repeat: -1
    });

    this.anims.create({
      key: sprite + "-right",
      frames: this.anims.generateFrameNumbers(sprite + "-right", {
        start: 0,
        end: 11
      }),
      frameRate: 30,
      repeat: -1
    });
  });
}

function update() {
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
      playerJump(this.player);
    }

    var x = this.player.x;
    var y = this.player.y;
    if (
      this.player.oldPosition &&
      (x !== this.player.oldPosition.x || y != this.player.oldPosition.y)
    ) {
      client.socket.emit("playerMovement", {
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
}

function addPlayer(self, playerInfo) {
  self.player = self.physics.add.sprite(
    playerInfo.x,
    playerInfo.y,
    playerInfo.spriteKey + "-" + playerInfo.direction
  );
  self.player.setBounce(0);
  self.player.body.setGravityY(500);
  self.player.setCollideWorldBounds(true);
  self.physics.add.collider(
    self.player,
    platforms,
    handlePlatformCollision,
    null,
    this
  );
  self.physics.add.overlap(
    self.player,
    self.otherPlayers,
    handlePlayersOverlap,
    null,
    this
  );

  self.player.playerID = playerInfo.playerID;
  self.player.alive = true;
  self.player.direction = playerInfo.direction;
  self.player.spriteKey = playerInfo.spriteKey;
  self.player.jumpCount = 0;
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.physics.add.sprite(
    playerInfo.x,
    playerInfo.y,
    playerInfo.spriteKey + "-" + playerInfo.direction
  );
  otherPlayer.playerID = playerInfo.playerID;
  otherPlayer.setBounce(0);
  otherPlayer.body.setGravityY(500);
  otherPlayer.setCollideWorldBounds(true);
  self.physics.add.collider(otherPlayer, platforms);

  self.otherPlayers.add(otherPlayer);
}

function handlePlayersOverlap(player, otherPlayer) {
  if (player.body.touching.right || player.body.touching.left) {
    console.log("Collide lateral");
  } else if (player.body.touching.down && otherPlayer.body.touching.up) {
    console.log("Caboom");
    client.socket.emit("playerKilled", {
      killerID: player.playerID,
      victimID: otherPlayer.playerID
    });
  }
}

function handlePlatformCollision(player, platform) {
  if (player.body.touching.down) {
    player.jumpCount = 0;
  }
}

function destroyPlayer(self, player) {
  player.alive = false;
  player.destroy();

  killBoom = self.physics.add.sprite(player.x, player.y, "disappearing");
  killBoom.body.setAllowGravity(false);
  killBoom.on(
    "animationcomplete",
    () => {
      killBoom.destroy();
    },
    self
  );
  killBoom.play("death");
}

function playerJump(player) {
  if (player.jumpCount == 0) {
    firstJump(player);
  }
  if (player.jumpCount == 1 && !player.body.touching.down) {
    secondJump(player);
  }
}

function firstJump(player) {
  player.jumpCount++;
  player.setVelocityY(-500);
}

function secondJump(player) {
  player.jumpCount++;
  player.setVelocityY(-500);
}
