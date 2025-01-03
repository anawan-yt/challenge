import TextureKey from '../consts/texture-key'

export default class Spike extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, dir: number) {
    super(scene, x, y, TextureKey.Spike)
    scene.physics.add.existing(this, true)

    this.angle = dir * 90
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setCircle(this.displayWidth / 3)
    body.setOffset(
      dir % 2 === 0 ? this.displayWidth / 6 : dir === 1 ? 0 : this.displayWidth / 3,
      dir % 2 === 1 ? this.displayWidth / 6 : dir === 0 ? this.displayWidth / 3 : 0
    )

    scene.add.existing(this)
  }
}
