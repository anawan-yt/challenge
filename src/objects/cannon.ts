import { CANNON_FIRE_RATE, DepthLayer, FIREBALL_VELOCITY, TILE_SIZE } from '../consts/globals'
import TextureKey from '../consts/texture-key'

export default class Cannon extends Phaser.GameObjects.Rectangle {
  private _dir: number
  private _lastFired: number
  private fireballs: Phaser.Physics.Arcade.Group
  private dirImage: Phaser.GameObjects.Image

  get dir() {
    return this._dir
  }

  get lastFired() {
    return this._lastFired
  }

  set lastFired(time: number) {
    this._lastFired = time
  }

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    dir: number,
    fireballs: Phaser.Physics.Arcade.Group,
    showDir: boolean = false
  ) {
    super(scene, x, y, TILE_SIZE, TILE_SIZE, 0x1d2b53)
    this.setOrigin(0)
    this.setDepth(DepthLayer.Cannon)
    this._dir = dir
    this._lastFired = 0
    this.fireballs = fireballs
    scene.add.existing(this)

    let dirX = x + (dir === 1 || dir === 3 ? TILE_SIZE / 2 : dir === 2 ? TILE_SIZE : 0)
    let dirY = y + (dir === 0 || dir === 2 ? TILE_SIZE / 2 : dir === 3 ? TILE_SIZE : 0)
    this.dirImage = scene.add.image(dirX, dirY, TextureKey.Fireball).setVisible(showDir)
  }

  destroyDirImage() {
    this.dirImage.destroy()
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
    fireball.setDepth(DepthLayer.Fireball)
    if (this.dir === 1 || this.dir === 3) {
      fireball.setVelocityY(FIREBALL_VELOCITY * (this.dir === 1 ? -1 : 1))
    } else {
      fireball.setVelocityX(FIREBALL_VELOCITY * (this.dir === 2 ? 1 : -1))
    }
  }
}
