var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 700 },
      debug: false
    }
  },
  scene: [Preloader, Menu, Game]
};

var game = new Phaser.Game(config);
