import AudioKey from '../../consts/audio-key'
import { TILE_SIZE } from '../../consts/globals'
import SceneKey from '../../consts/scene-key'
import TextureKey from '../../consts/texture-key'
import AudioScene from '../../scenes/audio-scene'

export default class IconButton extends Phaser.GameObjects.Container {
  private up: Phaser.GameObjects.Image
  private over: Phaser.GameObjects.Image
  private icon: Phaser.GameObjects.Sprite
  private defaultFrame: number
  private _isSelected: boolean

  set isSelected(state: boolean) {
    this._isSelected = state
    if (state) {
      this.onHover()
    } else {
      this.onUp()
    }
  }

  constructor(scene: Phaser.Scene, x: number, y: number, frame: number, onPointerDown: Function) {
    super(scene, x, y)

    this.defaultFrame = frame
    this._isSelected = false
    this.up = scene.add.image(0, 0, TextureKey.BtnIcon)
    this.over = scene.add.image(0, 0, TextureKey.BtnIcon, 1)
    this.over.setVisible(false)
    this.icon = scene.add.sprite(0, -4, TextureKey.Icons, frame)

    this.add([this.up, this.over, this.icon])
    scene.add.existing(this)

    this.setSize(TILE_SIZE, TILE_SIZE)
    this.setInteractive()
    this.on('pointerover', this.onHover, this)
    this.on('pointerout', this.onUp, this)
    this.on(
      'pointerdown',
      (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation()
        this.onHover()
        onPointerDown.call(scene, pointer, localX, localY, event)
        ;(this.scene.scene.get(SceneKey.Audio) as AudioScene).playSfx(AudioKey.SfxButton)
      },
      this
    )
  }

  toggleIcon(frame: number) {
    this.icon.setFrame(frame === parseInt(this.icon.frame.name) ? this.defaultFrame : frame)
  }

  onHover() {
    this.up.setVisible(false)
    this.over.setVisible(true)
    this.icon.y = 4
  }

  onUp() {
    if (this._isSelected) return
    this.up.setVisible(true)
    this.over.setVisible(false)
    this.icon.y = -4
  }

  rotateIcon(angle = 90) {
    this.icon.angle = (this.icon.angle + angle) % 360
  }

  setIconRotation(angle: number) {
    this.icon.angle = angle
  }
}
