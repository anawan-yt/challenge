import EventKey from '../consts/event-key'
import SceneKey from '../consts/scene-key'
import { transitionEventsEmitter } from '../utils/transition'

export default class TransitionScene extends Phaser.Scene {
  private isOpen!: boolean
  private rect1!: Phaser.GameObjects.Rectangle
  private rect2!: Phaser.GameObjects.Rectangle

  constructor() {
    super({ key: SceneKey.Transition })
  }

  create() {
    this.scene.bringToTop()
    const { width, height } = this.scale

    this.rect1 = this.add.rectangle(0, this.isOpen ? -height / 2 : 0, width, height / 2, 0x1d2b53)
    this.rect1.setOrigin(0, 0)
    this.rect2 = this.add.rectangle(0, this.isOpen ? height : height / 2, width, height / 2, 0x1d2b53)
    this.rect2.setOrigin(0, 0)

    transitionEventsEmitter.off(EventKey.TransitionStart, this.startTransition, this)
    transitionEventsEmitter.on(EventKey.TransitionStart, this.startTransition, this)

    this.startTransition()
  }

  startTransition() {
    if (this.isOpen) {
      if (this.input.keyboard?.manager) {
        this.input.keyboard.manager.enabled = false
      }
      if (this.input.mouse) {
        this.input.mouse!.enabled = false
      }
    }

    const { height } = this.scale

    this.tweens.add({
      targets: this.rect1,
      y: this.isOpen ? 0 : -height / 2,
      duration: 500,
      ease: 'Cubic.Out',
    })

    this.tweens.add({
      targets: this.rect2,
      y: this.isOpen ? height / 2 : height,
      duration: 500,
      ease: 'Cubic.Out',
      onComplete: () => {
        if (this.isOpen) {
          this.input.keyboard!.manager.enabled = true
          this.input.mouse!.enabled = true
        }
        transitionEventsEmitter.emit(EventKey.TransitionEnd)
      },
    })

    this.isOpen = !this.isOpen
  }
}
