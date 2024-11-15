export default class Panel extends Phaser.GameObjects.Graphics {
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene)

    this.fillStyle(0x000000)
    this.fillRect(x, y, width, height)
    this.fillStyle(0xffffff)
    this.fillRect(x + 4, y + 4, width - 8, height - 8)
    this.fillStyle(0xc2c3c7)
    this.fillRect(x + 8, y + 8, width - 16, height - 16)
  }
}
