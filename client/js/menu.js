var Menu = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function Menu() {
    Phaser.Scene.call(this, { key: "menu" });
  },

  preload: function() {},

  create: function() {
    this.add.image(400, 300, "sky");

    let socket = io();
    let allPlayers = [];

    this.input.keyboard.on("keydown_SPACE", function(event) {
      socket.emit("startGame");
    });

    socket.on("currentPlayers", players => {
      allPlayers = players;
    });

    socket.on("newPlayer", playerInfo => {
      allPlayers[playerInfo.playerID] = playerInfo;
    });

    socket.on("gameStarting", () => {
      this.scene.start("game", { socket: socket, players: allPlayers });
    });
  }
});
