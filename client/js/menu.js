var Menu = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function Menu() {
    Phaser.Scene.call(this, { key: "menu" });
  },

  preload: function() {},

  create: function() {
    this.add.image(480, 300, "sky");

    let socket = io();
    let allPlayers = {};
    let gameIsRunning;

    this.input.keyboard.on("keydown_SPACE", function(event) {
      if (!gameIsRunning) {
        socket.emit("startGame");
      } else {
        console.log("Sorry, game is running");
      }
    });

    socket.on("currentPlayers", data => {
      allPlayers = data.players;
      gameIsRunning = data.gameIsRunning;
    });

    socket.on("gameIsAvailable", data => {
      console.log("Game is available", data);
      allPlayers = data.players;
      gameIsRunning = data.gameIsRunning;
    });

    socket.on("newPlayer", playerInfo => {
      allPlayers[playerInfo.playerID] = playerInfo;
    });

    socket.on("gameStarting", () => {
      this.scene.start("game", { socket: socket, players: allPlayers });
    });
  }
});
