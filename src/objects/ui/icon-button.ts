import { TILE_SIZE } from '../../consts/globals'
import TextureKey from '../../consts/texture-key'

export default class IconButton extends Phaser.GameObjects.Container {
  private up: Phaser.GameObjects.Image
  private over: Phaser.GameObjects.Image
  private icon: Phaser.GameObjects.Sprite

  constructor(scene: Phaser.Scene, x: number, y: number, frame: number, onPointerDown: Function) {
    super(scene, x, y)

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
      (...args: any[]) => {
        this.onHover()
        onPointerDown.call(scene, ...args)
      },
      this
    )
  }

  onHover() {
    this.up.setVisible(false)
    this.over.setVisible(true)
    this.icon.y = 4
  }

  onUp() {
    this.up.setVisible(true)
    this.over.setVisible(false)
    this.icon.y = -4
  }
}
