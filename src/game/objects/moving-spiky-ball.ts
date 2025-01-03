import { SPIKY_BALL_SPEED, TILE_SIZE } from '../consts/globals'
import { LevelPosition } from '../consts/level'
import TextureKey from '../consts/texture-key'

export default class MovingSpikyBall extends Phaser.GameObjects.PathFollower {
  constructor(scene: Phaser.Scene, x: number, y: number, points: LevelPosition[], startAt: number) {
    const path = new Phaser.Curves.Path(x, y)
    for (let i = 0; i < points.length; i++) {
      path.lineTo(points[i].x, points[i].y)
    }

    path.lineTo(x, y)
    const pathLength = path.getLength()
    const duration = (pathLength / SPIKY_BALL_SPEED) * 1000
    super(scene, path, x, y, TextureKey.SpikyBall)
    this.setOrigin(0)

    this.startFollow({
      duration,
      repeat: -1,
      positionOnPath: true,
      startAt,
    })

    scene.physics.add.existing(this)
    const body = this.body as Phaser.Physics.Arcade.Body

    body.setCircle(TILE_SIZE / 2 - 2)
    body.setOffset(2, 2)

    scene.add.existing(this)
  }
}
