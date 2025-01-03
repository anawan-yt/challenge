import SceneKey from '../consts/scene-key'
import TextureKey from '../consts/texture-key'
import WebFontFile from '../utils/webfont'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKey.Boot })
  }

  preload() {
    this.load.setBaseURL('assets')
    this.load.image(TextureKey.Grid, 'grid.png')
    this.load.addFile(new WebFontFile(this.load, [TextureKey.FontHeading, `${TextureKey.FontBody}:700`]))
  }

  create() {
    this.scene.launch(SceneKey.Background)
    this.scene.sendToBack(SceneKey.Background)
    this.scene.start(SceneKey.Preloader)
  }
}
