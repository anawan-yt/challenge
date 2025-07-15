export default class Panel extends Phaser.GameObjects.Graphics {
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene)

    this.fillStyle(0x181425)
    this.fillRect(x, y, width, height)
    this.fillStyle(0xffffff)
    this.fillRect(x + 4, y + 4, width - 8, height - 8)
    this.fillStyle(0xc0cbdc)
    this.fillRect(x + 8, y + 8, width - 16, height - 16)
  }
}
