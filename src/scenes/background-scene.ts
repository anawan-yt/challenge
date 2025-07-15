import { WORLD_THEMES, WorldTheme } from '../consts/level'
import SceneKey from '../consts/scene-key'
import TextureKey from '../consts/texture-key'

export default class BackgroundScene extends Phaser.Scene {
  private animatedBackground!: Phaser.GameObjects.TileSprite
  private dir!: Phaser.Math.Vector2

  constructor() {
    super({ key: SceneKey.Background })
    this.dir = new Phaser.Math.Vector2(0.5, 0.5)
  }

  create() {
    this.animatedBackground = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, TextureKey.Grid)
      .setOrigin(0)
  }

  update() {
    this.animatedBackground.tilePositionX += this.dir.x
    this.animatedBackground.tilePositionY += this.dir.y
  }

  reset() {
    this.changeBackground(WORLD_THEMES[0])
  }

  changeBackground(theme: WorldTheme) {
    this.animatedBackground = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, theme.gridTexture)
      .setOrigin(0)
    this.dir = theme.dir
  }
}
