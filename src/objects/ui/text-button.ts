import AudioKey from '../../consts/audio-key'
import SceneKey from '../../consts/scene-key'
import TextureKey from '../../consts/texture-key'
import AudioScene from '../../scenes/audio-scene'

export default class TextButton extends Phaser.GameObjects.Container {
  private up: Phaser.GameObjects.Image
  private over: Phaser.GameObjects.Image
  private previousY: number
  private _text: string
  private textObject: Phaser.GameObjects.Text

  get text() {
    return this._text
  }

  set text(text: string) {
    this._text = text
    this.textObject.setText(text)
  }

  constructor(scene: Phaser.Scene, x: number, y: number, text: string, onPointerDown: Function) {
    super(scene, x, y)
    this._text = text

    this.up = scene.add.image(0, 0, TextureKey.BtnText)
    this.over = scene.add.image(0, 0, TextureKey.BtnText, 1)
    this.over.setVisible(false)
    this.textObject = scene.add.text(0, 0, text, {
      fontFamily: TextureKey.FontBody,
      fontSize: '40px',
      color: '#181425',
    })

    Phaser.Display.Align.In.Center(this.textObject, this.up)
    this.previousY = this.textObject.y
    this.add([this.up, this.over, this.textObject])
    scene.add.existing(this)

    this.setSize(this.up.displayWidth, this.up.displayHeight)
    this.setInteractive()
    this.on('pointerover', this.onHover, this)
    this.on('pointerout', this.onUp, this)
    this.on(
      'pointerdown',
      (...args: any[]) => {
        this.onHover()
        onPointerDown.call(scene, ...args)
        ;(this.scene.scene.get(SceneKey.Audio) as AudioScene).playSfx(AudioKey.SfxButton)
      },
      this
    )
  }

  onHover() {
    this.up.setVisible(false)
    this.over.setVisible(true)
    this.textObject.y = this.previousY + 4
  }

  onUp() {
    this.up.setVisible(true)
    this.over.setVisible(false)
    this.textObject.y = this.previousY
  }
}
