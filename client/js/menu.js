const platformXPositions = [600, 500, 400, 300];

var Menu = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function Menu() {
    Phaser.Scene.call(this, { key: "menu" });
  },

  preload: function() {},

  create: function() {
    this.add.image(480, 300, "sky");
    this.drawPlatform();
    this.availablePlatformPositions = platformXPositions;

    let socket = io();
    var self = this;
    this.allPlayers = {};
    this.playersData = {};
    let gameIsRunning;

    this.input.keyboard.on("keydown_SPACE", function(event) {
      if (!gameIsRunning) {
        socket.emit("startGame");
      }
    });

    socket.on("currentPlayers", data => {
      this.allPlayers = data.players;
      gameIsRunning = data.gameIsRunning;
      this.playerID = socket.id;
      if (!gameIsRunning) {
        this.showPlayers();
      } else {
        this.showGameRunning();
      }
    });

    socket.on("gameIsAvailable", data => {
      console.log("Game is available", data);
      this.allPlayers = data.players;
      gameIsRunning = data.gameIsRunning;
      this.showPlayers();
    });

    socket.on("newPlayer", playerInfo => {
      this.allPlayers[playerInfo.playerID] = playerInfo;
      this.drawPlayerInfo(this.allPlayers[playerInfo.playerID]);
    });

    socket.on("gameStarting", () => {
      this.scene.start("game", { socket: socket, players: this.allPlayers });
    });

    socket.on("disconnect", function(playerID) {
      self.playerExit(playerID);
    });
  },

  drawPlatform: function() {
    this.platform = this.physics.add.staticGroup();
    this.platform.create(450, 200, "ground");
  },

  drawPlayerInfo: function(player) {
    x = this.availablePlatformPositions.pop();
    var p = this.physics.add.sprite(
      x,
      100,
      player.spriteKey + "-" + player.direction
    );
    p.anims.play(player.spriteKey + "-idle-right", true);
    this.physics.add.collider(p, this.platform);

    var playerName = this.add.text(x - 15, 130, player.spriteKey);
    if (player.playerID === this.playerID) {
      playerName.setColor("#e6ed00");
    }

    this.playersData[player.playerID] = {
      playerSprite: p,
      playerName: playerName
    };
    console.log(this.playersData);
  },

  showPlayers: function() {
    for (var player in this.allPlayers) {
      this.drawPlayerInfo(this.allPlayers[player]);
    }
  },

  showGameRunning: function() {
    console.log("game running");
  },

  playerExit: function(playerID) {
    for (var id in this.playersData) {
      if (playerID === id) {
        this.playersData[id].playerSprite.destroy();
        this.playersData[id].playerName.destroy();

        delete this.allPlayers[id];
        this.availablePlatformPositions.push(
          this.playersData[id].playerSprite.x
        );
      }
    }
  }
});
