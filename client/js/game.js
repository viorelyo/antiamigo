var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 700},
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);
var platforms;

function preload() {
  this.load.image('sky', '../assets/sky.png');
  this.load.image('ground', '../assets/platform.png');

  this.load.spritesheet('dude-idle-left',
    '../assets/dude-idle-left.png',
    {frameWidth: 32, frameHeight: 32}
  );
  this.load.spritesheet('dude-idle-right',
    '../assets/dude-idle-right.png',
    {frameWidth: 32, frameHeight: 32}
  );
  this.load.spritesheet('dude-right',
    '../assets/dude-right.png',
    {frameWidth: 32, frameHeight: 32}
  );
  this.load.spritesheet('dude-left',
    '../assets/dude-left.png',
    {frameWidth: 32, frameHeight: 32}
  );
}

function create() {
  var self = this;

  this.socket = io();

  this.otherPlayers = this.physics.add.group();

  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerID === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });

  this.socket.on('newPlayer', function (playerInfo) {
    addOtherPlayers(self, playerInfo);
  });

  this.socket.on('playerMoved', playerInfo => {
    self.otherPlayers.getChildren().forEach(otherPlayer => {
      if (playerInfo.playerID === otherPlayer.playerID) {
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        otherPlayer.anims.play(playerInfo.direction, true);
      }
    });
  });

  this.socket.on('disconnect', function (playerID) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerID === otherPlayer.playerID) {
        otherPlayer.destroy();
      }
    });
  });


  this.add.image(400, 300, 'sky');

  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();
  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');

  cursors = this.input.keyboard.createCursorKeys();

  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude-left', {start: 0, end: 11}),
    frameRate: 30,
    repeat: -1
  });

  this.anims.create({
    key: 'idle-left',
    frames: this.anims.generateFrameNumbers('dude-idle-left', {start: 0, end: 10}),
    frameRate: 30,
    repeat: -1
  });

  this.anims.create({
    key: 'idle-right',
    frames: this.anims.generateFrameNumbers('dude-idle-right', {start: 0, end: 10}),
    frameRate: 30,
    repeat: -1
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude-right', {start: 0, end: 11}),
    frameRate: 30,
    repeat: -1
  });
}

function update() {
  if (this.player) {
    if (cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.anims.play('left', true);
      this.player.direction = "left";
    } else if (cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.player.anims.play('right', true);
      this.player.direction = "right";
    } else {
      this.player.setVelocityX(0);
      if (this.player.direction === "left" || this.player.direction === "idle-left") {
        this.player.anims.play('idle-left', true);
        this.player.direction = "idle-left";
      }
      else if (this.player.direction === "right" || this.player.direction === "idle-right") {
        this.player.anims.play('idle-right', true);
        this.player.direction = "idle-right";
      }
    }

    if (cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-700);
    }

    var x = this.player.x;
    var y = this.player.y;
    if (this.player.oldPosition && (x !== this.player.oldPosition.x || y != this.player.oldPosition.y)) {
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
}

function addPlayer(self, playerInfo) {
  self.player = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'dude-idle-right');
  self.player.setBounce(0);
  self.player.body.setGravityY(500);
  self.player.setCollideWorldBounds(true);
  self.physics.add.collider(self.player, platforms);
  self.player.direction = playerInfo.direction;
  console.log("AddPlayer:", self.player.direction);
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'dude-idle-right');
  otherPlayer.playerID = playerInfo.playerID;
  otherPlayer.setBounce(0);
  otherPlayer.body.setGravityY(500);
  otherPlayer.setCollideWorldBounds(true);
  self.physics.add.collider(otherPlayer, platforms);
  self.otherPlayers.add(otherPlayer);
}
