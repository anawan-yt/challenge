import { TILE_SIZE } from '../consts/globals'

export default class FallingBlock extends Phaser.GameObjects.Rectangle {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TILE_SIZE - 4, TILE_SIZE - 4, 0x5f574f)
    this.setOrigin(0)
    scene.add.existing(this)
  }

  fall() {
    this.scene.tweens.add({
      targets: this,
      duration: 80,
      repeat: 4,
      yoyo: true,
      ease: 'Bounce.easeInOut',
      x: this.x + 4,
      onComplete: () => {
        ;(this.body as Phaser.Physics.Arcade.Body).enable = false
        this.scene.tweens.add({
          targets: this,
          y: this.y + 80,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            this.destroy()
          },
        })
      },
    })
  }
}
