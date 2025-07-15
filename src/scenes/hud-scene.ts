import DataKey from '../consts/data-key'
import EventKey from '../consts/event-key'
import { CINEMATIC_FRAME_HEIGHT } from '../consts/globals'
import { GameMode } from '../consts/level'
import SceneKey from '../consts/scene-key'
import TextureKey, { IconsKey } from '../consts/texture-key'
import IconButton from '../objects/ui/icon-button'
import Panel from '../objects/ui/panel'
import { getLevelInfo, getLevelTotalCoins, updateLevelInfo } from '../utils/level'
import { stringifyTime } from '../utils/time'
import { transitionEventsEmitter } from '../utils/transition'
import GameScene from './game-scene'

export default class HUDScene extends Phaser.Scene {
  private cinematicFrameTop!: Phaser.GameObjects.Rectangle
  private cinematicFrameBottom!: Phaser.GameObjects.Rectangle
  private showCinematicFrames: boolean
  private coinsText!: Phaser.GameObjects.Text
  private timerText!: Phaser.GameObjects.Text
  private panelPause!: Phaser.GameObjects.Container
  private HUDItems!: Phaser.GameObjects.Container
  private coinsCollected!: number
  private timerStarted = false
  private startTime = 0
  private pauseTime = 0

  constructor() {
    super({ key: SceneKey.HUD })
    this.showCinematicFrames = false
  }

  create() {
    const { width, height } = this.scale

    this.cinematicFrameTop = this.add.rectangle(0, -CINEMATIC_FRAME_HEIGHT, width, CINEMATIC_FRAME_HEIGHT, 0x181425)
    this.cinematicFrameTop.setOrigin(0, 0)
    this.cinematicFrameBottom = this.add.rectangle(0, height, width, CINEMATIC_FRAME_HEIGHT, 0x181425)
    this.cinematicFrameBottom.setOrigin(0, 0)

    const mobileCursorsContainer = this.add.container()
    if (!this.sys.game.device.os.desktop) {
      const cursorLeft = this.add.image(180, 940, TextureKey.BtnCursor).setAngle(180).setAlpha(0.5)
      const cursorRight = this.add.image(420, 940, TextureKey.BtnCursor).setAlpha(0.5)
      mobileCursorsContainer.add([cursorLeft, cursorRight])
    }

    const gameScene = this.scene.get(SceneKey.Game) as GameScene
    const isCustomLevel = this.registry.get(DataKey.IsCustomLevel)
    const btnPause = new IconButton(this, 1840, 80, IconsKey.Pause, this.togglePause)
    if (!isCustomLevel) {
      this.input.keyboard?.on('keydown-P', this.togglePause, this)
      this.input.keyboard?.on('keydown-ESC', this.togglePause, this)
    } else {
      btnPause.disableInteractive().setVisible(false)
    }

    // Pièces
    this.coinsCollected = (this.registry.get(DataKey.CoinsCollected) || []).reduce(
      (acc: number, val: number) => acc + val,
      0
    )
    const coin = this.add.circle(60, 60, 20, 0xfee761)
    this.coinsText = this.add.text(92, 34, `x${this.coinsCollected.toString().padStart(2, '0')}`, {
      fontFamily: TextureKey.FontHeading,
      fontSize: '48px',
      color: '#ffffff',
    })
    gameScene.events.on(EventKey.CollectCoin, this.updateCoins, this)

    const isSpeedrunMode = this.registry.get(DataKey.GameMode) === GameMode.Speedrun
    this.timerStarted = false
    this.startTime = 0
    const timerBg = this.add.rectangle(0, 100, 320, 80, 0x262b44, 0.5).setOrigin(0)
    this.timerText = this.add.text(40, 110, '00\'00"000', {
      fontFamily: TextureKey.FontHeading,
      fontSize: '48px',
      color: '#ffffff',
    })
    const timerContainer = this.add.container(0, 0, [timerBg, this.timerText])
    timerContainer.setAlpha(isSpeedrunMode ? 1 : 0)

    gameScene.events.on(EventKey.StartTimer, this.startTimer, this)
    gameScene.events.on(EventKey.StopTimer, this.stopTimer, this)
    gameScene.events.on(EventKey.LevelEnd, this.handleLevelEnd, this)
    gameScene.events.on(EventKey.ToggleCinematicFrames, this.toggleCinematicFrames, this)

    // Panel
    const [panelWidth, panelHeight] = [640, 360]
    const [centerX, centerY] = [(width - panelWidth) / 2, (height - panelHeight) / 2]

    this.panelPause = this.add.container(0, 0)
    this.panelPause.setVisible(false)

    const panelOverlay = this.add.rectangle(0, 0, width, height, 0x262b44, 0.4)
    panelOverlay.setOrigin(0).setInteractive()

    const panelPauseBg = new Panel(this, centerX, centerY, panelWidth, panelHeight)
    const panelTxt = this.add
      .text(width / 2, centerY + 40, '- Pause -', {
        fontFamily: TextureKey.FontHeading,
        fontSize: '64px',
        color: '#181425',
      })
      .setOrigin(0.5, 0)

    const btnPlay = new IconButton(this, width / 2, height / 2 + 40, IconsKey.Play, this.togglePause)
    const btnRestart = new IconButton(
      this,
      width / 2 + 120,
      height / 2 + 40,
      IconsKey.Restart,
      this.restartCurrentLevel
    )
    const btnLevels = new IconButton(this, width / 2 - 120, height / 2 + 40, IconsKey.Levels, this.goToLevels)

    this.panelPause.add([panelOverlay, panelPauseBg, panelTxt, btnPlay, btnRestart, btnLevels])
    this.HUDItems = this.add.container(0, 0, [btnPause, coin, timerContainer, this.coinsText, mobileCursorsContainer])

    this.events.once('shutdown', this.handleShutdown, this)
  }

  toggleCinematicFrames() {
    this.showCinematicFrames = !this.showCinematicFrames
    this.HUDItems.setVisible(!this.showCinematicFrames)

    this.tweens.add({
      targets: this.cinematicFrameTop,
      y: this.showCinematicFrames ? 0 : -CINEMATIC_FRAME_HEIGHT,
      duration: 500,
      ease: 'Cubic.Out',
    })

    this.tweens.add({
      targets: this.cinematicFrameBottom,
      y: this.showCinematicFrames ? this.scale.height - CINEMATIC_FRAME_HEIGHT : this.scale.height,
      duration: 500,
      ease: 'Cubic.Out',
    })
  }

  handleShutdown() {
    const gameScene = this.scene.get(SceneKey.Game) as GameScene
    gameScene.events.off(EventKey.StartTimer, this.startTimer, this)
    gameScene.events.off(EventKey.StopTimer, this.stopTimer, this)
    gameScene.events.off(EventKey.LevelEnd, this.handleLevelEnd, this)
    gameScene.events.off(EventKey.CollectCoin, this.updateCoins, this)
    gameScene.events.off(EventKey.ToggleCinematicFrames, this.toggleCinematicFrames, this)
  }

  goToLevels() {
    transitionEventsEmitter.emit(EventKey.TransitionStart)
    transitionEventsEmitter.once(
      EventKey.TransitionEnd,
      () => {
        this.registry.set(DataKey.IsPaused, false)
        const gameScene = this.scene.get(SceneKey.Game)
        gameScene.scene.start(SceneKey.Levels)
      },
      this
    )
  }

  restartCurrentLevel() {
    transitionEventsEmitter.emit(EventKey.TransitionStart)
    transitionEventsEmitter.once(
      EventKey.TransitionEnd,
      () => {
        this.registry.set(DataKey.IsPaused, false)
        this.scene.start(SceneKey.Game)
        this.scene.restart()
      },
      this
    )
  }

  togglePause() {
    if (this.showCinematicFrames) return
    const isPaused = this.registry.get(DataKey.IsPaused)
    if (isPaused) {
      this.scene.resume(SceneKey.Game)
      this.pauseTime = this.time.now - this.pauseTime
      this.startTime += this.pauseTime
    } else {
      this.scene.pause(SceneKey.Game)
      ;(this.scene.get(SceneKey.Game) as GameScene).resetPointers()
      this.pauseTime = this.time.now
    }

    this.panelPause.setVisible(!isPaused)
    this.registry.set(DataKey.IsPaused, !isPaused)
  }

  handleLevelEnd({
    currentLevel,
    startedFromCheckpoint,
  }: {
    currentLevel: number | null
    startedFromCheckpoint: boolean
  }) {
    this.stopTimer.call(this)
    if (!currentLevel) return

    const levelInfo = getLevelInfo(currentLevel)
    if (!levelInfo) return

    const previousBestTime = levelInfo.time || Infinity
    const newTime = this.time.now - this.startTime
    const levelTotalCoins = getLevelTotalCoins(currentLevel)
    const previousMaxCoins = levelInfo.coins || 0

    updateLevelInfo(currentLevel, {
      ...(this.registry.get(DataKey.GameMode) === GameMode.Speedrun && newTime < previousBestTime && { time: newTime }),
      ...(this.coinsCollected > previousMaxCoins && { coins: this.coinsCollected }),
      ...(this.coinsCollected === levelTotalCoins && !startedFromCheckpoint && { shinyCoin: true }),
    })

    this.startTime = 0
  }

  stopTimer() {
    const isSpeedrunMode = this.registry.get(DataKey.GameMode) === GameMode.Speedrun
    if (!this.timerStarted || !isSpeedrunMode) return
    this.timerStarted = false
  }

  startTimer() {
    this.timerStarted = true
    this.startTime = this.time.now
  }

  updateCoins() {
    this.coinsCollected += 1
    this.coinsText.setText(`x${this.coinsCollected.toString().padStart(2, '0')}`)
  }

  update() {
    const isPaused = this.registry.get(DataKey.IsPaused)

    if (this.startTime === 0 || !this.timerStarted || isPaused) return
    const time = stringifyTime(this.time.now - this.startTime)
    this.timerText.setText(time)
  }
}
