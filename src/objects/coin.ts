import { COIN_SIZE } from '../consts/globals'

export default class Coin extends Phaser.GameObjects.Arc {
  private _collectedIndex: number

  get collectedIndex() {
    return this._collectedIndex
  }

  constructor(scene: Phaser.Scene, x: number, y: number, collectedIndex: number) {
    super(scene, x, y, COIN_SIZE / 2, 0, 360, false, 0xfee761)
    this.setOrigin(0)
    this._collectedIndex = collectedIndex

    scene.physics.add.existing(this, true)
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setCircle(20)
    body.setOffset(10, 10)

    scene.add.existing(this)
  }
}
