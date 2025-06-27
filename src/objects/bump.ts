import { BUMP_DISABLE_DURATION, TILE_SIZE } from '../consts/globals'
import TextureKey from '../consts/texture-key'

export default class Bump extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    const offset = TILE_SIZE / 2
    super(scene, x + offset, y + offset, TextureKey.Bump)
    this.angle = 45
    scene.add.existing(this)

    this.scene.tweens.add({
      targets: this,
      scale: 0.9,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    scene.physics.add.existing(this, true)
    ;(this.body as Phaser.Physics.Arcade.Body).setSize(TILE_SIZE / 2, TILE_SIZE / 2)
  }

  disappear() {
    const body = this.body as Phaser.Physics.Arcade.Body
    body.enable = false
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 300,
      yoyo: true,
      hold: BUMP_DISABLE_DURATION,
      ease: 'Cubic.Out',
      onComplete: () => {
        body.enable = true
        this.alpha = 1
      },
    })
  }
}
