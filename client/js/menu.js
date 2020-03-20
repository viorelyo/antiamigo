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
    this.allPlayers = {};
    let gameIsRunning;

    this.input.keyboard.on("keydown_SPACE", function(event) {
      if (!gameIsRunning) {
        socket.emit("startGame");
      } else {
        console.log("Sorry, game is running");
      }
    });

    socket.on("currentPlayers", data => {
      this.allPlayers = data.players;
      gameIsRunning = data.gameIsRunning;
      this.playerID = socket.id;
      if (!gameIsRunning) {
        this.showPlayers();
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

    // socket.on("disconnect", function(playerID) {
    //   for (var player in this.allPlayers) {
    //     if (playerID === this.allPlayers[player].playerID) {
    //       delete this.allPlayers[player];
    //     }
    //   }
    // });
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
  },

  showPlayers: function() {
    for (var player in this.allPlayers) {
      this.drawPlayerInfo(this.allPlayers[player]);
    }
  }
});
