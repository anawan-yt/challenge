export default class Platform extends Phaser.GameObjects.Rectangle {
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, color: number) {
    super(scene, x, y, width, height, color)
    this.setOrigin(0)
    scene.add.existing(this)
  }
}
