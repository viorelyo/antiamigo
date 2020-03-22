var config = {
  type: Phaser.AUTO,
  width: 1080,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      width: 960,
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: [Preloader, Menu, Game]
};

var game = new Phaser.Game(config);
