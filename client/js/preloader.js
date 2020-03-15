const sprites = ["dude", "frog", "pink", "guy"];

var Preloader = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function Preloader() {
    Phaser.Scene.call(this, {
      key: "preloader",
      pack: {
        files: [
          {
            type: "image",
            key: "loadingbar_bg",
            url: "assets/loadingbar_bg.png"
          },
          {
            type: "image",
            key: "loadingbar_fill",
            url: "assets/loadingbar_fill.png"
          }
        ]
      }
    });
  },

  setPreloadSprite: function(sprite) {
    this.preloadSprite = {
      sprite: sprite,
      width: sprite.width,
      height: sprite.height
    };
    sprite.visible = true;

    this.load.on("progress", this.onProgress, this);
    this.load.on("fileprogress", this.onFileProgress, this);
  },

  onProgress: function(value) {
    if (this.preloadSprite) {
      var w = Math.floor(this.preloadSprite.width * value);

      this.preloadSprite.sprite.frame.width = w <= 0 ? 1 : w;
      this.preloadSprite.sprite.frame.cutWidth = w;

      this.preloadSprite.sprite.frame.updateUVs();
    }
  },

  onFileProgress: function(file) {
    console.log("onFileProgress: file.key=" + file.key);
  },

  preload: function() {
    var self = this;

    this.loadingbar_bg = this.add.sprite(400, 300, "loadingbar_bg");
    this.loadingbar_fill = this.add.sprite(400, 300, "loadingbar_fill");
    this.setPreloadSprite(this.loadingbar_fill);

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

    // dispose loade bar images
    this.loadingbar_bg.destroy();
    this.loadingbar_fill.destroy();
    this.preloadSprite = null;

    this.scene.start("menu");
  }
});
