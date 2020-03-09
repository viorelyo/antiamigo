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
  this.load.image('star', '../assets/star.png');
  this.load.image('bomb', '../assets/bomb.png');
  this.load.spritesheet('dude',
    '../assets/dude.png',
    {frameWidth: 32, frameHeight: 48}
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
    frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'turn',
    frames: [{key: 'dude', frame: 4}],
    frameRate: 20
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
    frameRate: 10,
    repeat: -1
  });
}

function update() {
  let direction = 'turn';
  if (this.player) {
    if (cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.anims.play('left', true);
      direction = "left";
    } else if (cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.player.anims.play('right', true);
      direction = "right";
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
      direction = "turn";
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
        direction: direction
      });
    }

    this.player.oldPosition = {
      x: this.player.x,
      y: this.player.y
    };
  }
}

function addPlayer(self, playerInfo) {
  self.player = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'dude');
  self.player.setBounce(0);
  self.player.body.setGravityY(500);
  self.player.setCollideWorldBounds(true);
  self.physics.add.collider(self.player, platforms);
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'dude');
  otherPlayer.playerID = playerInfo.playerID;
  otherPlayer.setBounce(0);
  otherPlayer.body.setGravityY(500);
  otherPlayer.setCollideWorldBounds(true);
  self.physics.add.collider(otherPlayer, platforms);
  self.otherPlayers.add(otherPlayer);
}
