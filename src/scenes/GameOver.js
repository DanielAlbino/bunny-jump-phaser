import Phaser from "../lib/phaser.js";

export default class GameOver extends Phaser.Scene {
  constructor() {
    super("game-over");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.add
      .text(width * 0.5, height * 0.4, "Game Over", {
        fontSize: 48,
      })
      .setOrigin(0.5);
    this.add
      .text(width * 0.5, height * 0.5, "Press Space to Start", {
        fontSize: 24,
      })
      .setOrigin(0.5);

    this.input.keyboard.once("keydown_SPACE", () => {
      this.scene.start("game");
    });
  }
}
