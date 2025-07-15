import DataKey from '../consts/data-key'
import EventKey from '../consts/event-key'
import { GameMode } from '../consts/level'
import SceneKey from '../consts/scene-key'
import TextureKey, { IconsKey } from '../consts/texture-key'
import IconButton from '../objects/ui/icon-button'
import { transitionEventsEmitter } from '../utils/transition'

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKey.Intro })
  }

  preload() {
    const mode = localStorage.getItem(DataKey.GameMode) || GameMode.Classic
    this.registry.set(DataKey.GameMode, mode)
  }

  create() {
    new IconButton(this, 1840, 80, IconsKey.Settings, this.goToSettings)

    const text = this.add
      .text(
        960,
        920,
        `${this.sys.game.device.os.desktop ? "Appuie sur la touche 'ESPACE'" : "Touche l'écran"} pour commencer`,
        { fontFamily: TextureKey.FontHeading, fontSize: '48px', color: '#262b44' }
      )
      .setOrigin(0.5, 0.5)

    this.tweens.add({
      targets: text,
      duration: 1000,
      alpha: 0,
      repeat: -1,
      yoyo: true,
    })

    this.add
      .text(968, 488, 'Hey \nBobby!', {
        fontFamily: TextureKey.FontHeading,
        fontSize: '200px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: -40,
      })
      .setOrigin(0.5, 0.5)
    const animatedText = this.add
      .text(960, 480, 'Hey \nBobby!', {
        fontFamily: TextureKey.FontHeading,
        fontSize: '200px',
        color: '#262b44',
        align: 'center',
        lineSpacing: -40,
      })
      .setOrigin(0.5, 0.5)

    const timeline = this.add.timeline([
      {
        at: 500,
        tween: {
          targets: animatedText,
          y: animatedText.y - 20,
          ease: 'Power2',
          duration: 300,
        },
      },
      {
        at: 800,
        tween: {
          targets: animatedText,
          y: animatedText.y,
          ease: 'Bounce.easeOut',
          duration: 800,
        },
      },
    ])

    timeline.play()

    this.input.keyboard!.on('keydown-SPACE', this.startGame, this)
    this.input.on('pointerdown', this.startGame, this)

    this.scene.launch(SceneKey.Transition)
    this.scene.launch(SceneKey.Audio)
  }

  goToSettings(_: Phaser.Input.Pointer, __: number, ___: number, event: Phaser.Types.Input.EventData) {
    event.stopPropagation()
    transitionEventsEmitter.emit(EventKey.TransitionStart)
    transitionEventsEmitter.once(EventKey.TransitionEnd, () => this.scene.start(SceneKey.Settings), this)
  }

  startGame() {
    transitionEventsEmitter.emit(EventKey.TransitionStart)
    transitionEventsEmitter.once(EventKey.TransitionEnd, () => this.scene.start(SceneKey.Levels), this)
    // transitionEventsEmitter.once(EventKey.TransitionEnd, () => this.scene.start(SceneKey.Game, { number: 9 }))
  }
}
