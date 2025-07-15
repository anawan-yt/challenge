export default class Lava extends Phaser.GameObjects.Rectangle {
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y, width, height, 0xf77622)
    this.setOrigin(0)
    scene.add.existing(this)
  }
}
