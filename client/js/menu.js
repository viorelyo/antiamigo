var Menu = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function Menu() {
    Phaser.Scene.call(this, { key: "menu" });
  },

  preload: function() {},

  create: function() {
    let socket = io();

    this.allPlayers;

    this.input.keyboard.on("keydown_A", function(event) {
      console.log("Hello from the A Key!");
      socket.emit("startGame");
    });

    socket.on("currentPlayers", players => {
      console.log("Players got in Menu: ", players);
      this.allPlayers = players;
    });

    socket.on("newPlayer", playerInfo => {
      console.log("New Player Joined");
      this.allPlayers[playerInfo.playerID] = playerInfo;
      console.log("Updated Players", this.allPlayers);
    });

    socket.on("gameStarting", () => {
      this.scene.start("game", { socket: socket, players: this.allPlayers });
    });
  }
});
