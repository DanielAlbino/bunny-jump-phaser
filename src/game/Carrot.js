import Phaser from "../lib/phaser.js";

export default class Carrot extends Phaser.Physics.Arcade.Sprite {
  /**
   *  @param {Phaser.Scene} Scene
   *  @param {number} x
   *  @param {number} y
   *  @param {string} texture
   */

  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    this.setScale(0.5);
  }

  /*   preload() {
    this.load.image("carrot", "src/assets/carrot.png");
  }

  create() {
    this.add.image(240, 320, "carrot").setScrollFactor(1, 0);
  } */
}
