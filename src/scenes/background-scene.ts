import SceneKey from '../consts/scene-key'
import TextureKey from '../consts/texture-key'

export default class BackgroundScene extends Phaser.Scene {
  private animatedBackground!: Phaser.GameObjects.TileSprite

  constructor() {
    super({ key: SceneKey.Background })
  }

  create() {
    this.animatedBackground = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, TextureKey.Grid)
      .setOrigin(0)
  }

  update() {
    this.animatedBackground.tilePositionX += 0.5
    this.animatedBackground.tilePositionY += 0.5
  }
}
