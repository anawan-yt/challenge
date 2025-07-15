import AudioKey from '../consts/audio-key'
import DataKey from '../consts/data-key'
import EventKey from '../consts/event-key'
import { NUM_LEVELS_BY_WORLD } from '../consts/globals'
import { GameMode, WORLD_THEMES, WorldTheme } from '../consts/level'
import SceneKey from '../consts/scene-key'
import TextureKey, { IconsKey } from '../consts/texture-key'
import IconButton from '../objects/ui/icon-button'
import TextButton from '../objects/ui/text-button'
import { getCurrentWorld, getLevelInfo, getLevelTotalCoins, setCurrentWorld } from '../utils/level'
import { stringifyTime } from '../utils/time'
import { transitionEventsEmitter } from '../utils/transition'
import AudioScene from './audio-scene'
import customLevel from '../levels/custom.json'
import { levelsData } from '../levels'
import BackgroundScene from './background-scene'

export interface LevelsSceneProps {
  world?: number
}

export default class LevelsScene extends Phaser.Scene {
  private currentWorld!: number
  private theme!: WorldTheme

  constructor() {
    super({ key: SceneKey.Levels })
  }

  init(data: LevelsSceneProps) {
    let targetWorld = data.world
    if (!targetWorld) {
      targetWorld = getCurrentWorld()
    } else {
      setCurrentWorld(targetWorld)
    }
    this.currentWorld = targetWorld
    this.theme = WORLD_THEMES[this.currentWorld - 1]
    ;(this.scene.get(SceneKey.Background) as BackgroundScene).changeBackground(this.theme)
  }

  create() {
    const { width, height } = this.scale
    this.scene.stop(SceneKey.HUD)
    this.scene.stop(SceneKey.Editor)
    this.registry.set(DataKey.IsCheckpointActive, false)
    this.registry.set(DataKey.CoinsCollected, false)

    this.add
      .text(width / 2, 24, `MONDE ${this.currentWorld}`, {
        fontFamily: TextureKey.FontHeading,
        fontSize: '96px',
        color: '#' + this.theme.button.toString(16).padStart(6, '0'),
      })
      .setOrigin(0.5, 0)

    new IconButton(this, 80, 80, IconsKey.Back, () => this.goToScreen(SceneKey.Intro))
    new TextButton(this, width / 2, height - 120, 'Éditeur de niveaux', () => {
      this.goToScreen(SceneKey.Game, { level: customLevel })
    })

    // Niveaux
    const buttonOffset = 96
    const buttonSize = 160
    const buttonsPerCol = 2
    const buttonsPerRow = Math.ceil(NUM_LEVELS_BY_WORLD / buttonsPerCol)

    const totalButtonsWidth = (buttonSize + buttonOffset) * (buttonsPerRow - 1)
    const totalButtonsHeight = (buttonSize + buttonOffset) * (buttonsPerCol - 1)
    const startX = this.cameras.main.centerX - totalButtonsWidth / 2
    const startY = this.cameras.main.centerY - totalButtonsHeight / 2

    if (this.currentWorld > 1) {
      new IconButton(this, width / 2 - totalButtonsWidth / 2 - 280, height / 2, IconsKey.Chevron, () =>
        this.goToWorld(this.currentWorld - 1)
      ).rotateIcon(180)
    }

    const maxWorlds = Math.ceil(Object.keys(levelsData).length / NUM_LEVELS_BY_WORLD)
    if (this.currentWorld < maxWorlds) {
      new IconButton(this, width / 2 + totalButtonsWidth / 2 + 280, height / 2, IconsKey.Chevron, () =>
        this.goToWorld(this.currentWorld + 1)
      )
    }

    for (let i = 0; i < NUM_LEVELS_BY_WORLD; i++) {
      const level = i + 1 + (this.currentWorld - 1) * NUM_LEVELS_BY_WORLD
      const col = Math.floor(i / buttonsPerCol)
      const row = i % buttonsPerCol
      const direction = i % 2 ? 1 : -1

      const x = startX + col * (buttonSize + buttonOffset) + ((buttonSize + buttonOffset) / 4) * direction
      const y = startY + row * (buttonSize + buttonOffset) - ((buttonSize + buttonOffset) / 4) * direction
      const timePosY = y + buttonSize * direction

      const button = this.add.rectangle(x, y, buttonSize, buttonSize, this.theme.button)

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
            color: '#262b44',
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
        this.add.circle(x, y + 48, 8, levelInfo?.shinyCoin ? 0xfee761 : 0xf77622)
      }
    }

    this.scene.launch(SceneKey.Transition)
  }

  goToScreen(screen: string, params = {}) {
    transitionEventsEmitter.emit(EventKey.TransitionStart)
    transitionEventsEmitter.once(
      EventKey.TransitionEnd,
      () => {
        ;(this.scene.get(SceneKey.Background) as BackgroundScene).reset()
        this.scene.start(screen, params)
      },
      this
    )
  }

  goToWorld(world: number) {
    const data: LevelsSceneProps = { world }
    transitionEventsEmitter.emit(EventKey.TransitionStart)
    transitionEventsEmitter.once(EventKey.TransitionEnd, () => this.scene.restart(data))
  }
}
