import AudioKey from '../consts/audio-key'
import DataKey from '../consts/data-key'
import EventKey from '../consts/event-key'
import { NUM_LEVELS } from '../consts/globals'
import { DataLevel, GameMode } from '../consts/level'
import SceneKey from '../consts/scene-key'
import TextureKey, { IconsKey } from '../consts/texture-key'
import IconButton from '../objects/ui/icon-button'
import TextButton from '../objects/ui/text-button'
import { EventBus } from '../utils/event-bus'
import { getLevelInfo, getLevelTotalCoins } from '../utils/level'
import { stringifyTime } from '../utils/time'
import { transitionEventsEmitter } from '../utils/transition'
import AudioScene from './audio-scene'

export default class LevelsScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKey.Levels })
  }

  create() {
    const { width, height } = this.scale
    this.scene.stop(SceneKey.HUD)
    this.registry.set(DataKey.IsCheckpointActive, false)
    this.registry.set(DataKey.CoinsCollected, false)

    new IconButton(this, 80, 80, IconsKey.Back, () => this.goToScreen(SceneKey.Intro))
    new TextButton(this, width / 2, height - 120, 'Éditeur de niveaux', () => {
      EventBus.emit(EventKey.EditorToggle)
    })

    // Niveaux
    const buttonOffset = 96
    const buttonSize = 160
    const buttonsPerCol = 2
    const buttonsPerRow = Math.ceil(NUM_LEVELS / buttonsPerCol)

    const totalButtonsWidth = (buttonSize + buttonOffset) * (buttonsPerRow - 1)
    const totalButtonsHeight = (buttonSize + buttonOffset) * (buttonsPerCol - 1)
    const startX = this.cameras.main.centerX - totalButtonsWidth / 2
    const startY = this.cameras.main.centerY - totalButtonsHeight / 2

    for (let i = 0; i < NUM_LEVELS; i++) {
      const level = i + 1
      const col = Math.floor(i / buttonsPerCol)
      const row = i % buttonsPerCol
      const direction = i % 2 ? 1 : -1

      const x = startX + col * (buttonSize + buttonOffset) + ((buttonSize + buttonOffset) / 4) * direction
      const y = startY + row * (buttonSize + buttonOffset) - ((buttonSize + buttonOffset) / 4) * direction
      const timePosY = y + buttonSize * direction

      const button = this.add.rectangle(x, y, buttonSize, buttonSize, 0x1d2b53)

      const levelInfo = getLevelInfo(level)
      button.rotation = Phaser.Math.DegToRad(45)

      if (levelInfo) {
        button.setInteractive()
        button.on('pointerdown', () => {
          ;(this.scene.get(SceneKey.Audio) as AudioScene).playSfx(AudioKey.SfxButton)
          this.goToScreen(SceneKey.Game, { number: level })
        })
      } else {
        button.alpha = 0.5
      }

      const time = (levelInfo && levelInfo.time) || 0
      const mode = this.registry.get(DataKey.GameMode)
      if (time && mode === GameMode.Speedrun) {
        this.add.rectangle(x, timePosY, 200, 60, 0xffffff).setOrigin(0.5)
        this.add
          .text(x, timePosY, time ? stringifyTime(time) : '10\'00"00', {
            fontFamily: TextureKey.FontBody,
            color: '#1d2b53',
            fontSize: '32px',
          })
          .setOrigin(0.5)
      }

      this.add
        .text(x, y, (i + 1).toString(), { fontFamily: TextureKey.FontHeading, color: '#ffffff', fontSize: '64px' })
        .setOrigin(0.5)

      // Pièces max
      const coins = (levelInfo && levelInfo.coins) || 0
      const levelTotalCoins = getLevelTotalCoins(level)
      if (coins > 0 && coins === levelTotalCoins) {
        this.add.circle(x, y + 48, 8, levelInfo?.shinyCoin ? 0xffec27 : 0xffa300)
      }
    }

    EventBus.on(EventKey.EditorPlaytest, (level: DataLevel) => {
      this.goToScreen(SceneKey.Game, { level })
    })

    this.scene.launch(SceneKey.Transition)
  }

  goToScreen(screen: string, params = {}) {
    transitionEventsEmitter.emit(EventKey.TransitionStart)
    transitionEventsEmitter.once(EventKey.TransitionEnd, () => this.scene.start(screen, params), this)
  }
}
