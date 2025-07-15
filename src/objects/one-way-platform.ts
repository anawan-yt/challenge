import { TILE_SIZE } from '../consts/globals'
import { LevelPosition } from '../consts/level'

export interface OneWayPlatformFollower {
  path: Phaser.Curves.Path
  t: number
  vec: Phaser.Math.Vector2
}

export default class OneWayPlatform extends Phaser.GameObjects.Rectangle {
  private _isMoving = false
  private _follower?: OneWayPlatformFollower

  get isMoving() {
    return this._isMoving
  }

  get follower() {
    return this._follower
  }

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, points?: LevelPosition[]) {
    super(scene, x, y, width, TILE_SIZE / 2, 0xe8b796)
    this.setOrigin(0)
    scene.physics.add.existing(this)
    const body = this.body as Phaser.Physics.Arcade.Body
    body.checkCollision.down = false
    body.checkCollision.left = false
    body.checkCollision.right = false
    scene.add.existing(this)

    if (!points) return

    const path = new Phaser.Curves.Path(x, y)
    for (let i = 0; i < points.length; i++) {
      path.lineTo(points[i].x, points[i].y)
    }

    path.lineTo(x, y)
    this._isMoving = true
    this._follower = {
      path,
      t: 0,
      vec: new Phaser.Math.Vector2(),
    }
  }
}
