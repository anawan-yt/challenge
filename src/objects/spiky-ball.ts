import { TILE_SIZE } from '../consts/globals'
import TextureKey from '../consts/texture-key'

export default class SpikyBall extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TextureKey.SpikyBall)
    this.setOrigin(0)

    scene.physics.add.existing(this)
    const body = this.body as Phaser.Physics.Arcade.Body

    body.setCircle(TILE_SIZE / 2 - 2)
    body.setOffset(2, 2)

    scene.add.existing(this)
  }
}
