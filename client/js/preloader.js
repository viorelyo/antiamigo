const sprites = ["dude", "frog", "pink", "guy"];

var Preloader = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function Preloader() {
    Phaser.Scene.call(this, {
      key: "preloader",
      pack: {
        files: []
      }
    });
  },

  preload: function() {
    var self = this;

    this.load.image("sky", "../assets/sky.png");
    this.load.image("ground", "../assets/platform.png");

    this.load.spritesheet("disappearing", "../assets/disappearing.png", {
      frameWidth: 96,
      frameHeight: 96
    });

    sprites.forEach(sprite => {
      self.load.spritesheet(
        sprite + "-idle-left",
        "../assets/" + sprite + "-idle-left.png",
        { frameWidth: 32, frameHeight: 32 }
      );
      self.load.spritesheet(
        sprite + "-idle-right",
        "../assets/" + sprite + "-idle-right.png",
        { frameWidth: 32, frameHeight: 32 }
      );
      self.load.spritesheet(
        sprite + "-right",
        "../assets/" + sprite + "-right.png",
        { frameWidth: 32, frameHeight: 32 }
      );
      self.load.spritesheet(
        sprite + "-left",
        "../assets/" + sprite + "-left.png",
        { frameWidth: 32, frameHeight: 32 }
      );
    });
  },

  create: function() {
    this.anims.create({
      key: "death",
      frames: this.anims.generateFrameNumbers("disappearing", {
        start: 0,
        end: 6
      }),
      frameRate: 20,
      repeat: 1
    });

    sprites.forEach(sprite => {
      this.anims.create({
        key: sprite + "-left",
        frames: this.anims.generateFrameNumbers(sprite + "-left", {
          start: 0,
          end: 11
        }),
        frameRate: 30,
        repeat: -1
      });

      this.anims.create({
        key: sprite + "-idle-left",
        frames: this.anims.generateFrameNumbers(sprite + "-idle-left", {
          start: 0,
          end: 10
        }),
        frameRate: 30,
        repeat: -1
      });

      this.anims.create({
        key: sprite + "-idle-right",
        frames: this.anims.generateFrameNumbers(sprite + "-idle-right", {
          start: 0,
          end: 10
        }),
        frameRate: 30,
        repeat: -1
      });

      this.anims.create({
        key: sprite + "-right",
        frames: this.anims.generateFrameNumbers(sprite + "-right", {
          start: 0,
          end: 11
        }),
        frameRate: 30,
        repeat: -1
      });
    });

    this.scene.start("menu");
  }
});
