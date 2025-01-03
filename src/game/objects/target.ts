import TextureKey from '../consts/texture-key'

export default class Target extends Phaser.GameObjects.Arc {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    scene.add.particles(x, y, TextureKey.Particle, {
      speed: { min: -200, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 1000,
      frequency: 100,
      quantity: 5,
    })

    super(scene, x, y, 40, 0, 360, false, 0x1d2b53)

    scene.physics.add.existing(this, true)
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setCircle(80)
    body.setOffset(-40, -40)

    scene.add.existing(this)
  }
}
