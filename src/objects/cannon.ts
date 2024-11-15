import { CANNON_FIRE_RATE, FIREBALL_VELOCITY, TILE_SIZE } from '../consts/globals'
import TextureKey from '../consts/texture-key'

export default class Cannon extends Phaser.GameObjects.Rectangle {
  private _dir: number
  private _lastFired: number
  private fireballs: Phaser.Physics.Arcade.Group

  get dir() {
    return this._dir
  }

  get lastFired() {
    return this._lastFired
  }

  set lastFired(time: number) {
    this._lastFired = time
  }

  constructor(scene: Phaser.Scene, x: number, y: number, dir: number, fireballs: Phaser.Physics.Arcade.Group) {
    super(scene, x, y, TILE_SIZE, TILE_SIZE, 0x1d2b53)
    this.setOrigin(0)
    this._dir = dir
    this._lastFired = 0
    this.fireballs = fireballs
    scene.add.existing(this)
  }

  update(time: number) {
    if (time >= this.lastFired + CANNON_FIRE_RATE) {
      this.shoot()
      this.lastFired = time
    }
  }

  shoot() {
    const fireball = this.fireballs.get(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2, TextureKey.Fireball)
    fireball.body.setCircle(12)
    fireball.body.setOffset(8, 8)
    if (this.dir === 1 || this.dir === 3) {
      fireball.setVelocityY(FIREBALL_VELOCITY * (this.dir === 1 ? -1 : 1))
    } else {
      fireball.setVelocityX(FIREBALL_VELOCITY * (this.dir === 2 ? 1 : -1))
    }
  }
}
