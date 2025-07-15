import { LAVA_BALL_DELAY, LAVA_BALL_VELOCITY, TILE_SIZE } from '../consts/globals'
import TextureKey from '../consts/texture-key'

export default class LavaBall extends Phaser.GameObjects.Image {
  private startY: number

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x + TILE_SIZE / 4, y + TILE_SIZE / 4, TextureKey.Fireball)
    this.startY = y + TILE_SIZE / 4
    this.setOrigin(0)
    scene.physics.world.enable(this)
    const body = this.body as Phaser.Physics.Arcade.Body

    body.setCircle(12)
    body.setOffset(8, 8)
    scene.add.existing(this)
    this.bounce()

    scene.time.addEvent({
      delay: LAVA_BALL_DELAY,
      loop: true,
      callback: this.bounce,
      callbackScope: this,
    })
  }

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body
    if (body.velocity.y > 0 && this.y >= this.startY) {
      body.setVelocityY(0)
      this.y = this.startY
    }
  }

  bounce() {
    ;(this.body as Phaser.Physics.Arcade.Body).setVelocityY(LAVA_BALL_VELOCITY)
  }
}
