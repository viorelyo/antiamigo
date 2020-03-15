var config = {
  type: Phaser.AUTO,
  width: 960,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: [Preloader, Menu, Game]
};

var game = new Phaser.Game(config);
