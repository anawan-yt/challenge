import TextureKey from '../consts/texture-key'

const bodyRadius = 80
export default class Target extends Phaser.GameObjects.Arc {
  private emitter: Phaser.GameObjects.Particles.ParticleEmitter
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 40, 0, 360, false, 0x1d2b53)
    this.emitter = scene.add.particles(x, y, TextureKey.Particle, {
      speed: { min: -200, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 1000,
      frequency: 100,
      quantity: 5,
    })

    scene.physics.add.existing(this, true)
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setCircle(bodyRadius)
    body.setOffset(-bodyRadius / 2, -bodyRadius / 2)

    scene.add.existing(this)
  }

  moveTo(x: number, y: number) {
    this.setPosition(x, y)
    this.emitter.setPosition(x, y)
    const body = this.body as Phaser.Physics.Arcade.Body
    body.reset(x, y)
  }
}
