var Menu = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function Menu() {
    Phaser.Scene.call(this, { key: "menu" });
  },

  preload: function() {},

  create: function() {
    console.log("Created");
    let socket = io();

    console.log(socket);

    // socket.on("currentPlayers", players => {
    // console.log("Oponents got in Menu", players);
    // this.scene.start("game", { socket: socket, opponents: players });
    this.scene.start("game", { socket: socket });
    // });
  }
});
