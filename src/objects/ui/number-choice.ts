import { TILE_SIZE } from '../../consts/globals'
import TextureKey, { IconsKey } from '../../consts/texture-key'
import IconButton from './icon-button'

interface NumberChoiceProps {
  scene: Phaser.Scene
  x: number
  y: number
  title: string
  onUpdate: Function
  step?: number
  min?: number
  max?: number
}

export default class NumberChoice extends Phaser.GameObjects.Container {
  private _value: number
  private step: number
  private min: number
  private max: number
  private text: Phaser.GameObjects.Text

  set value(value: number) {
    this._value = value
    this.updateText()
  }

  constructor({ scene, x, y, title, onUpdate, step = 1, min = -99, max = 99 }: NumberChoiceProps) {
    super(scene, x, y)
    this._value = 0
    this.step = step
    this.min = min
    this.max = max
    const minus = new IconButton(scene, 0, 0, IconsKey.Minus, () => {
      this.decrease()
      onUpdate.call(this, this._value)
    })

    const [bgWidth, bgHeight] = [TILE_SIZE, (TILE_SIZE / 4) * 3]
    const [bgX, bgY] = [TILE_SIZE / 2 - 4, -TILE_SIZE / 4 - 2]
    const graphics = scene.add.graphics()
    graphics.fillStyle(0xffffff, 1)
    graphics.fillRect(bgX, bgY, bgWidth, bgHeight)
    graphics.lineStyle(4, 0x000000, 1)
    graphics.strokeRect(bgX, bgY, bgWidth, bgHeight)

    const plus = new IconButton(scene, TILE_SIZE * 2 - 6, 0, IconsKey.Plus, () => {
      this.increase()
      onUpdate.call(this, this._value)
    })

    this.text = scene.add
      .text(TILE_SIZE - 2, 8, this._value.toString(), {
        fontFamily: TextureKey.FontBody,
        fontSize: '32px',
        color: '#000000',
      })
      .setOrigin(0.5)

    const titleText = scene.add
      .text(TILE_SIZE - 2, -40, title, {
        fontFamily: TextureKey.FontBody,
        fontSize: '24px',
        color: '#000000',
      })
      .setOrigin(0.5)

    this.add([graphics, minus, plus, this.text, titleText])
    scene.add.existing(this)
    this.setSize(TILE_SIZE * 3 - 8, TILE_SIZE)
  }

  decrease() {
    if (this._value <= this.min) return
    this._value = Math.round((this._value - this.step) * 100) / 100
    this.updateText()
  }

  increase() {
    if (this._value >= this.max) return
    this._value = Math.round((this._value + this.step) * 100) / 100
    this.updateText()
  }

  updateText() {
    this.text.setText(this._value.toString())
  }
}
