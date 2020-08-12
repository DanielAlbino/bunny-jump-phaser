import Phaser from "../lib/phaser.js";
import Carrot from "../game/Carrot.js";

export default class Game extends Phaser.Scene {
  /** @type {Phaser.Physics.Arcade.Sprite} */
  player;
  platforms;
  cursors;
  carrots;
  carrotsCollected = 0;
  carrotsCollectedText;

  constructor() {
    super("game");
  }
  init() {
    this.carrotsCollected = 0;
  }

  preload() {
    this.load.image("background", "src/assets/bg1.png");

    //load the platform image
    this.load.image("platform", "src/assets/ground_grass.png");

    //add a bunny
    this.load.image("bunny-stand", "src/assets/bunny1_stand.png");
    this.load.image("bunny-jump", "src/assets/bunny1_jump.png");

    this.load.image("carrot", "src/assets/carrot.png");

    //player moves
    this.cursors = this.input.keyboard.createCursorKeys();

    //sound effects
    this.load.audio("jump", "src/assets/sfx/phaseJump1.ogg");
  }

  create() {
    this.add.image(240, 320, "background").setScrollFactor(1, 0);

    //create the bunny sprite
    this.player = this.physics.add
      .sprite(240, 320, "bunny-stand")
      .setScale(0.5);

    //create multiple platforms
    this.platforms = this.physics.add.staticGroup();

    this.physics.add.collider(this.platforms, this.player);

    //create 5 platforms from the group
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(80, 400);
      const y = 150 * i;

      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = this.platforms.create(x, y, "platform");
      platform.scale = 0.5;

      /**  @type {Phaser.Physics.Arcade.StaticBody}*/
      const body = platform.body;
      body.updateFromGameObject();
    }

    //check for collisions
    this.player.body.checkCollision.up = false;
    this.player.body.checkCollision.left = false;
    this.player.body.checkCollision.right = false;

    //camera to follow the player
    this.cameras.main.startFollow(this.player);

    //cameras dead zones
    this.cameras.main.setDeadzone(this.scale.width * 1.5);

    //create a carrot
    this.carrots = this.physics.add.group({
      classType: Carrot,
    });
    this.physics.add.collider(this.platforms, this.carrots);

    this.physics.add.overlap(
      this.player,
      this.carrots,
      this.handleColletCarrot,
      undefined,
      this
    );

    //Display how many carrots the player caught
    const style = { color: "#000", fontSize: 24 };
    this.carrotsCollectedText = this.add
      .text(240, 10, "Carrots: 0", style)
      .setScrollFactor(0)
      .setOrigin(0.5, 0);
  }

  update(t, dt) {
    //find out from Arcade Physics if the player's physics body
    // is touching something below it
    const touchingDown = this.player.body.touching.down;

    if (touchingDown) {
      //this makes the bunny jump straight up
      this.player.setVelocityY(-300);
      this.player.setTexture("bunny-jump");
      this.sound.play("jump");
    }

    const vy = this.player.body.velocity.y;
    if (vy > 0 && this.player.texture.key !== "bunny-stand") {
      //switch back to stand when falling
      this.player.setTexture("bunny-stand");
    }

    //reusing the platforms
    this.platforms.children.iterate((child) => {
      /** @type {Phaser.Physics.Arcade.Sprite} */

      const platform = child;
      const scrollY = this.cameras.main.scrollY;
      if (platform.y >= scrollY + 700) {
        platform.y = scrollY - Phaser.Math.Between(50, 100);
        platform.body.updateFromGameObject();
        this.addCarrotAbove(platform);
      }
    });

    //Move Logic
    if (this.cursors.left.isDown && !touchingDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown && !touchingDown) {
      this.player.setVelocityX(200);
    } else {
      //stop movement
      this.player.setVelocityX(0);
    }

    //Horizontal wrap around
    this.horizontalWrap(this.player);

    const bottomPlatform = this.findBottomMostPlatform();
    if (this.player.y > bottomPlatform.y + 200) {
      this.scene.start("game-over");
    }
  }

  /**
   *  @param {Phaser.GameObjects.Sprite} sprite
   */

  horizontalWrap(sprite) {
    const halfWidth = sprite.displayWidth * 0.5;
    const gameWidth = this.scale.width;

    if (sprite.x <= -halfWidth) {
      sprite.x = gameWidth + halfWidth;
    } else if (sprite.x > gameWidth + halfWidth) {
      sprite.x = -halfWidth;
    }
  }

  //add carrots to the game
  addCarrotAbove(sprite) {
    const y = sprite.y - sprite - sprite.displayHeight;
    /** @type {Phaser.Physics.Arcade.Sprite} */
    const carrot = this.carrots.get(sprite.x, sprite.y, "carrot");

    //set active and visible
    carrot.setActive(true);
    carrot.setVisible(true);
    this.add.existing(carrot);
    carrot.body.setSize(carrot.width, carrot.height);

    //make sure body is enabled in the physics world
    this.physics.world.enable(carrot);

    return carrot;
  }

  /**
   *  @param {Phaser.Physics.Arcade.Sprite} player
   *  @param {Carrot} carrot
   */

  handleColletCarrot(player, carrot) {
    //hide from display
    this.carrots.killAndHide(carrot);

    //disable from phisics world
    this.physics.world.disableBody(carrot.body);

    //increment by 1
    this.carrotsCollected++;

    //create new text value and set it
    const value = `Carrots: ${this.carrotsCollected}`;
    this.carrotsCollectedText.text = value;
  }

  //Hanfling Game Over
  findBottomMostPlatform() {
    const platforms = this.platforms.getChildren();
    let bottomPlatform = platforms[0];
    for (let i = 1; i < platforms.length; i++) {
      const platform = platforms[i];

      //discard any plaftforms that are above current
      if (platform.y < bottomPlatform.y) {
        continue;
      }
      bottomPlatform = platform;
    }
    return bottomPlatform;
  }
}
