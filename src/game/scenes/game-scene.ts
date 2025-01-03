import AnalyticsKey from '../consts/analytics-key'
import {
  BOSS_BOUNCE_VELOCITY,
  COIN_SIZE,
  ENEMY2_JUMP_DELAY,
  ENEMY_VELOCITY,
  NUM_LEVELS,
  PlayerMode,
  TILE_SIZE,
} from '../consts/globals'
import {
  DataLevel,
  GameMode,
  LevelEnemy,
  LevelEventBlock,
  LevelFallingBlock,
  LevelOneWayPlatform,
  LevelSpike,
  LevelSpikyBall,
} from '../consts/level'
import SceneKey from '../consts/scene-key'
import TextureKey from '../consts/texture-key'
import { levelsData } from '../levels'
import { addDesignEvent, addProgressionEvent, ProgressionEventType } from '../utils/analytics'
import { getLevelTotalCoins, unlockLevel } from '../utils/level'
import { transitionEventsEmitter } from '../utils/transition'
import { isTouchingFromAbove } from '../utils/helpers'
import AudioScene from './audio-scene'
import DataKey from '../consts/data-key'
import EventKey from '../consts/event-key'
import AudioKey from '../consts/audio-key'
import Player from '../objects/player'
import Platform from '../objects/platform'
import OneWayPlatform from '../objects/one-way-platform'
import Cannon from '../objects/cannon'
import Spike from '../objects/spike'
import SpikyBall from '../objects/spiky-ball'
import MovingSpikyBall from '../objects/moving-spiky-ball'
import FallingBlock from '../objects/falling-block'
import Transformer from '../objects/transformer'
import Target from '../objects/target'
import Coin from '../objects/coin'
import Boss from '../objects/boss'
import EventBlock from '../objects/event-block'

interface Keys {
  [key: string]: { isDown: boolean }
}

export default class GameScene extends Phaser.Scene {
  private currentLevel: number | null = null
  private levelData!: DataLevel
  private isCustomLevel = false
  private _canMove = false
  private isReady = false
  private touchLeft = false
  private touchRight = false
  private timerStarted = false
  private _playerMode = PlayerMode.Platformer
  private isCheckpointActive = false
  private startedFromCheckpoint = false
  private coinsCollected!: number[]
  private isSpeedrunMode!: boolean
  private _audioManager!: AudioScene
  private isTransitionning = false
  private worldWidth!: number
  private worldHeight!: number
  private hills!: Phaser.GameObjects.Group
  private hills2!: Phaser.GameObjects.Group
  private clouds!: Phaser.Physics.Arcade.Group
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private coins!: Phaser.Physics.Arcade.StaticGroup
  private oneWayPlatforms!: Phaser.Physics.Arcade.Group
  private cannons!: Phaser.Physics.Arcade.StaticGroup
  private fireballs!: Phaser.Physics.Arcade.Group
  private target!: Target
  private fallingBlocks!: Phaser.Physics.Arcade.StaticGroup
  private eventBlocks!: Phaser.Physics.Arcade.StaticGroup
  private fallingBlocksTriggers!: Phaser.Physics.Arcade.StaticGroup
  private transformers!: Phaser.Physics.Arcade.StaticGroup
  private enemies!: Phaser.Physics.Arcade.Group
  private checkpointFlag!: Phaser.GameObjects.Triangle
  private checkpoint!: Phaser.GameObjects.Container
  private player!: Player
  private playerShadowHitbox!: Phaser.GameObjects.Rectangle
  private coinsEmitter!: Phaser.GameObjects.Particles.ParticleEmitter

  private enemiesCollider!: Phaser.Physics.Arcade.Collider
  private bossCollider!: Phaser.Physics.Arcade.Collider
  private bossTrigger!: Phaser.GameObjects.Rectangle
  private platformsCollider!: Phaser.Physics.Arcade.Collider
  private cannonsCollider!: Phaser.Physics.Arcade.Collider
  private oneWayPlatformsCollider!: Phaser.Physics.Arcade.Collider
  private fallingBlocksCollider!: Phaser.Physics.Arcade.Collider
  private eventBlocksCollider!: Phaser.Physics.Arcade.Collider
  private fallingBlocksTriggersOverlap!: Phaser.Physics.Arcade.Collider
  private transformersTriggers!: Phaser.Physics.Arcade.Collider
  private checkpointTrigger!: Phaser.Physics.Arcade.Collider
  private coinsTriggers!: Phaser.Physics.Arcade.Collider
  private targetTrigger!: Phaser.Physics.Arcade.Collider
  private zKey!: Phaser.Input.Keyboard.Key
  private upKey!: Phaser.Input.Keyboard.Key
  private spaceKey!: Phaser.Input.Keyboard.Key
  private boss: Boss | null = null

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private keys!: Keys

  private stickedPlatform: OneWayPlatform | null = null
  private stickedVelocityX = 0

  constructor() {
    super({ key: SceneKey.Game })
  }

  get audioManager() {
    return this._audioManager
  }

  get canMove() {
    return this._canMove
  }

  get playerMode() {
    return this._playerMode
  }

  get playerRef() {
    return this.player
  }

  init(data: { number?: number; level?: DataLevel }) {
    if (data.number) {
      this.currentLevel = data.number
      this.isCustomLevel = false
      this.levelData = levelsData[`level${this.currentLevel}`]
    } else if (data.level) {
      this.levelData = data.level
      this.isCustomLevel = true
    }
    this.registry.set(DataKey.IsCustomLevel, this.isCustomLevel)
  }

  create() {
    this._canMove = false
    this.isReady = false
    this.touchLeft = false
    this.touchRight = false
    this.timerStarted = false
    this._playerMode = PlayerMode.Platformer
    this.isCheckpointActive = this.registry.get(DataKey.IsCheckpointActive)
    this.startedFromCheckpoint = this.isCheckpointActive
    const coinsCollected = this.registry.get(DataKey.CoinsCollected) || []
    this.coinsCollected = [...coinsCollected]
    this.isSpeedrunMode = this.registry.get(DataKey.GameMode) === GameMode.Speedrun
    this._audioManager = this.scene.get(SceneKey.Audio) as AudioScene
    this.time.delayedCall(
      500,
      () => {
        this.isReady = true
      },
      [],
      this
    )
    this.isTransitionning = false
    this.worldWidth = this.levelData.world.width
    this.worldHeight = this.levelData.world.height
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight)

    this.add.rectangle(0, 0, this.worldWidth, this.worldHeight, 0x29adff).setOrigin(0)

    const hillsPos = this.levelData.hills ?? []
    this.hills = this.add.group()
    for (let i = 0; i < hillsPos.length; i++) {
      let hill = this.hills.create(hillsPos[i].x, hillsPos[i].y, TextureKey.Hill)
      hill.setOrigin(0)
      hill.setScrollFactor(0.3)
    }

    const hillsPos2 = this.levelData.hillsFront ?? []
    this.hills2 = this.add.group()
    for (let i = 0; i < hillsPos2.length; i++) {
      let hill = this.hills2.create(hillsPos2[i].x, hillsPos2[i].y, TextureKey.Hill2)
      hill.setOrigin(0)
      hill.setScrollFactor(0.4)
    }

    const cloudsPos = this.levelData.clouds?.x ?? []
    this.clouds = this.physics.add.group({
      allowGravity: false,
    })
    for (let i = 0; i < cloudsPos.length; i++) {
      let cloud = this.clouds.create(
        cloudsPos[i],
        Phaser.Math.Between(this.levelData.clouds!.y.min, this.levelData.clouds!.y.max),
        TextureKey.Cloud
      )
      cloud.setVelocityX(Phaser.Math.Between(10, 20))
      cloud.setAlpha(Phaser.Math.FloatBetween(0.2, 0.8))
    }

    // Boss
    if (this.levelData.isBoss) {
      this.boss = new Boss(this)
      const { x, y, width, height } = this.levelData.bossTrigger!
      this.bossTrigger = this.add.rectangle(x, y, width, height).setOrigin(0)
      this.physics.add.existing(this.bossTrigger, true)
    }

    // Plateformes
    this.platforms = this.physics.add.staticGroup({
      classType: Platform,
    })
    const platformsPos = this.levelData.platforms || []
    for (let i = 0; i < platformsPos.length; i++) {
      const { x, y, width, height } = platformsPos[i]
      const platform = new Platform(this, x, y, width, height)
      this.platforms.add(platform)
    }

    // Plateformes à sens unique
    this.oneWayPlatforms = this.physics.add.group({
      classType: OneWayPlatform,
      allowGravity: false,
      immovable: true,
    })
    const oneWayPlatformsPos = this.levelData.oneWayPlatforms || []
    for (let i = 0; i < oneWayPlatformsPos.length; i++) {
      this.addOneWayPlatform(this.oneWayPlatforms, oneWayPlatformsPos[i])
    }

    this.fireballs = this.physics.add.group({
      allowGravity: false,
    })

    // Canons
    this.cannons = this.physics.add.staticGroup({
      classType: Cannon,
      runChildUpdate: true,
    })
    const cannonsPos = this.levelData.cannons || []
    for (let i = 0; i < cannonsPos.length; i++) {
      const { x, y, dir = 2 } = cannonsPos[i]
      const cannon = new Cannon(this, x, y, dir, this.fireballs)
      this.cannons.add(cannon)
    }

    // Créer le téléporteur et les particules
    this.target = new Target(this, this.levelData.target.x, this.levelData.target.y)

    // Pics
    const spikes = this.physics.add.staticGroup()
    const spikesPos = this.levelData.spikes ?? []
    for (let i = 0; i < spikesPos.length; i++) {
      this.addSpikes(spikes, spikesPos[i])
    }

    const spikyBalls = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    })
    const spikyBallsPos = this.levelData.spikyBalls ?? []
    for (let i = 0; i < spikyBallsPos.length; i++) {
      this.addSpikyBall(spikyBalls, spikyBallsPos[i])
    }

    // Plateformes sensibles
    this.fallingBlocks = this.physics.add.staticGroup({
      classType: FallingBlock,
    })
    this.fallingBlocksTriggers = this.physics.add.staticGroup()
    const fallingBlocksPos = this.levelData.fallingBlocks ?? []
    for (let i = 0; i < fallingBlocksPos.length; i++) {
      this.addFallingBlock(this.fallingBlocks, this.fallingBlocksTriggers, fallingBlocksPos[i])
    }

    // Event Blocks
    this.eventBlocks = this.physics.add.staticGroup()
    const eventBlocksPos = this.levelData.eventBlocks ?? []
    for (let i = 0; i < eventBlocksPos.length; i++) {
      this.addEventBlock(this.eventBlocks, eventBlocksPos[i])
    }

    // Transformers
    this.transformers = this.physics.add.staticGroup()
    const transformersPos = this.levelData.transformers ?? []
    for (let i = 0; i < transformersPos.length; i++) {
      const { x, y, width = TILE_SIZE / 4, height = TILE_SIZE / 4, mode = PlayerMode.Platformer } = transformersPos[i]
      new Transformer(this, x, y, width, height, mode, this.transformers)
    }

    // Ennemis
    this.enemies = this.physics.add.group()
    const enemiesPos = this.levelData.enemies ?? []
    for (let i = 0; i < enemiesPos.length; i++) {
      this.addEnemy(this.enemies, enemiesPos[i])
    }

    // Pièces
    this.addCoins()

    // Checkpoint
    if (this.levelData.checkpoint && !this.isSpeedrunMode) {
      const pole = this.add.rectangle(0, 0, 20, 240, 0xc2c3c7)
      this.checkpointFlag = this.add
        .triangle(90, pole.height / 2 - 8 - (this.isCheckpointActive ? 120 : 0), 0, -40, 80, 0, 0, 40, 0xffa300)
        .setOrigin(1, 0.5)
      this.checkpoint = this.add.container(this.levelData.checkpoint.x, this.levelData.checkpoint.y, [
        pole,
        this.checkpointFlag,
      ])
      this.physics.add.existing(this.checkpoint, true)
      ;(this.checkpoint.body as Phaser.Physics.Arcade.Body).setSize(pole.width, pole.height)
      ;(this.checkpoint.body as Phaser.Physics.Arcade.Body).setOffset(22, -88)
    }

    // Créer le joueur
    const startingPos = this.isCheckpointActive
      ? { x: this.levelData.checkpoint!.x - TILE_SIZE, y: this.levelData.checkpoint!.y }
      : this.levelData.player
    this.player = new Player(this, startingPos.x, startingPos.y)

    this.playerShadowHitbox = this.add.rectangle(
      this.levelData.player.x,
      this.levelData.player.y,
      TILE_SIZE,
      TILE_SIZE,
      0xfff1e8,
      0
    )
    this.physics.add.existing(this.playerShadowHitbox, true)

    // Particules pièces
    this.coinsEmitter = this.add.particles(0, 0, TextureKey.ParticleCoin, {
      lifespan: 300,
      speed: { min: 160, max: 200 },
      angle: { min: 0, max: 360 },
      frequency: -1,
      scale: { start: 1, end: 0.2 },
      alpha: { start: 1, end: 0 },
    })

    // Mort du joueur
    this.physics.add.overlap(this.player, spikes, this.die, undefined, this)
    this.physics.add.overlap(this.player, this.fireballs, this.die, undefined, this)
    this.physics.add.overlap(this.player, spikyBalls, this.die, undefined, this)
    this.enemiesCollider = this.physics.add.overlap(
      this.enemies,
      this.player,
      this.handleEnemiesCollision,
      undefined,
      this
    )

    // Ajouter la collision entre le joueur, les ennemis et le sol
    this.physics.add.overlap(this.platforms, this.fireballs, this.destroyFireball, undefined, this)
    this.platformsCollider = this.physics.add.collider(this.player, this.platforms)
    this.cannonsCollider = this.physics.add.collider(this.player, this.cannons)
    this.oneWayPlatformsCollider = this.physics.add.collider(
      this.player,
      this.oneWayPlatforms,
      this.stickPlayerToPlatform,
      undefined,
      this
    )
    this.physics.add.collider(this.enemies, this.platforms)
    this.physics.add.collider(this.enemies, this.oneWayPlatforms)
    this.physics.add.collider(this.enemies, this.fallingBlocks)
    this.fallingBlocksCollider = this.physics.add.collider(this.player, this.fallingBlocks)
    this.eventBlocksCollider = this.physics.add.collider(this.player, this.eventBlocks)
    this.fallingBlocksTriggersOverlap = this.physics.add.overlap(
      this.player,
      this.fallingBlocksTriggers,
      this.handleFallingBlockCollision,
      undefined,
      this
    )
    this.transformersTriggers = this.physics.add.overlap(
      this.player,
      this.transformers,
      this.handleTransformerCheck,
      undefined,
      this
    )

    if (this.boss) {
      this.physics.add.collider(this.boss, this.platforms)
      this.bossCollider = this.physics.add.overlap(this.boss, this.player, this.handleBossCollision, undefined, this)
      this.physics.add.overlap(this.player, this.bossTrigger!, this.handleBossTrigger, undefined, this)
      this.events.on(EventKey.UnlockEventBlocks, this.unlockEventBlocks, this)
      this.events.on(EventKey.UnfreezePlayer, this.unfreezePlayer, this)
    }

    // Détection checkpoint
    if (this.levelData.checkpoint && !this.isCheckpointActive) {
      this.checkpointTrigger = this.physics.add.overlap(
        this.player,
        this.checkpoint,
        this.handleCheckpoint,
        undefined,
        this
      )
    }

    // Pièces
    this.coinsTriggers = this.physics.add.overlap(this.player, this.coins, this.handleCoin, undefined, this)

    // Detection de fin de jeu
    this.targetTrigger = this.physics.add.overlap(this.player, this.target, this.teleport, undefined, this)

    // Suivi de la caméra
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight)

    // Créer les contrôles
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.keys = this.input.keyboard!.addKeys('Q,D') as Keys
    this.zKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
    this.upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP)
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.input.keyboard!.on('keyup-UP', () => this.player.resetJump(), this)
    this.input.keyboard!.on('keyup-Z', () => this.player.resetJump(), this)
    this.input.keyboard!.on('keyup-SPACE', () => this.player.resetJump(), this)
    this.input.keyboard!.on('keydown-R', this.handlRestartToggle, this)

    // Mobiles
    if (!this.sys.game.device.os.desktop) {
      // Pointers
      this.input.on('pointerdown', this.handlePointerDown, this)
      this.input.on('pointermove', this.handlePointerMove, this)
      this.input.on('pointerup', this.handlePointerUp, this)
    }

    // Limite horizontale du monde
    this.events.on('postupdate', this.checkWorldBounds, this)
    this.events.once('shutdown', () => {
      this.events.off('postupdate', this.checkWorldBounds)
      this.events.off(EventKey.UnlockEventBlocks, this.unlockEventBlocks, this)
      this.events.off(EventKey.UnfreezePlayer, this.unfreezePlayer, this)
    })

    // HUD
    this.scene.launch(SceneKey.HUD)

    // Transition
    this.scene.launch(SceneKey.Transition)
  }

  update(time: number, delta: number) {
    const justTriggeredJump =
      Phaser.Input.Keyboard.JustDown(this.zKey) ||
      Phaser.Input.Keyboard.JustDown(this.upKey) ||
      Phaser.Input.Keyboard.JustDown(this.spaceKey)

    const isGoingLeft = this.cursors.left.isDown || this.keys.Q.isDown || this.touchLeft
    const isGoingRight = this.cursors.right.isDown || this.keys.D.isDown || this.touchRight

    // Check du premier mouvement pour déclencher le timer
    if (justTriggeredJump || isGoingLeft || isGoingRight) this.checkFirstMove()

    // Mouvement des ennemis
    this.enemies
      .getChildren()
      .filter((enemy) => !enemy.getData('isDead'))
      .forEach((enemy) => {
        let dir = enemy.getData('dir')
        const body = enemy.body as Phaser.Physics.Arcade.Body

        if (enemy.getData('type') === 2) {
          if (body.blocked.down) {
            body.setVelocityX(0)
          }
        } else {
          if (body.blocked.right) {
            dir = -1
          } else if (body.blocked.left) {
            dir = 1
          }
          enemy.setData('dir', dir)
          body.setVelocityX(ENEMY_VELOCITY * dir)
        }
      })

    this.boss?.update()

    // Reset des nuages
    this.clouds.getChildren().forEach((object) => {
      const cloud = object as Phaser.GameObjects.Sprite
      if (cloud.x > this.physics.world.bounds.width) {
        cloud.x = -120
      }
    })

    // Plateformes mobiles
    this.handleMovingPlatforms(time, delta)

    if (!this._canMove) return

    this.player.update({
      time,
      isGoingLeft,
      isGoingRight,
      playerMode: this.playerMode,
      stickedVelocityX: this.stickedVelocityX,
      justTriggeredJump,
    })

    // Sortie du monde
    if (
      this.player.y - (this.player.body as Phaser.Physics.Arcade.Body).height / 2 >
      this.physics.world.bounds.height
    ) {
      this.die.call(this)
    }
  }

  destroyFireball: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_: any, fireball: any) => {
    fireball.destroy()
  }

  checkWorldBounds() {
    const playerHalfWidth = (this.player.body as Phaser.Physics.Arcade.Body).width / 2
    if (this.player.x - playerHalfWidth < 0) {
      this.player.x = playerHalfWidth
    } else if (this.player.x + playerHalfWidth > this.physics.world.bounds.width) {
      this.player.x = this.physics.world.bounds.width - playerHalfWidth
    }
  }

  startTimer() {
    this.timerStarted = true
    this._canMove = true
    this.events.emit(EventKey.StartTimer)

    // Analytics
    this.trackProgression(ProgressionEventType.Start)
  }

  handlePointerDown(pointer: Phaser.Input.Pointer) {
    // Saut lors du touch sur la zone droite de l'écran
    if (pointer.x > 960) {
      this.checkFirstMove()
      this.player.jump()
    }

    this.handlePointerMove(pointer)
  }

  unlockEventBlocks() {
    this.eventBlocks.clear(true, true)
    this.audioManager.playSfx(AudioKey.SfxUnlock)
  }

  handleBossTrigger() {
    this.freezePlayer()
    this.bossTrigger.destroy()
    this.time.delayedCall(2000, () => {
      this.boss?.fall()
    })
  }

  freezePlayer() {
    this.events.emit(EventKey.ToggleCinematicFrames)
    ;(this.player.body as Phaser.Physics.Arcade.Body).velocity.x = 0
    this._canMove = false
  }

  unfreezePlayer() {
    this.events.emit(EventKey.ToggleCinematicFrames)
    this._canMove = true
  }

  handlePointerMove(pointer: Phaser.Input.Pointer) {
    if (pointer.x < 300) {
      this.touchRight = false
      this.touchLeft = true
    } else if (pointer.x < 600) {
      this.touchRight = true
      this.touchLeft = false
    }
  }

  handlePointerUp(pointer: Phaser.Input.Pointer) {
    if (pointer.x > 600) {
      this.player.resetJump()
      return
    }
    this.resetPointers()
  }

  resetPointers() {
    this.touchLeft = false
    this.touchRight = false
  }

  checkFirstMove() {
    if (!this.isReady || this.timerStarted) return
    this.startTimer()
  }

  checkPlayerRightAbovePlatform() {
    const platformsToCheck = [
      ...this.platforms.getChildren(),
      ...this.oneWayPlatforms.getChildren(),
      ...this.fallingBlocks.getChildren(),
    ]
    this.playerShadowHitbox.x = this.player.x
    this.playerShadowHitbox.y = this.player.y + TILE_SIZE / 2
    ;(this.playerShadowHitbox.body as Phaser.Physics.Arcade.Body).updateFromGameObject()
    return this.physics.overlap(this.playerShadowHitbox, platformsToCheck)
  }

  teleport() {
    this._canMove = false
    ;(this.player.body as Phaser.Physics.Arcade.Body).enable = false
    this.events.emit(EventKey.LevelEnd, {
      currentLevel: this.currentLevel,
      startedFromCheckpoint: this.startedFromCheckpoint,
    })
    this.audioManager.playSfx(AudioKey.SfxWin)

    if (this.currentLevel && this.currentLevel < NUM_LEVELS && this.currentLevel < Object.keys(levelsData).length) {
      unlockLevel(this.currentLevel + 1)
    }

    // Analytics
    this.trackProgression(ProgressionEventType.Complete)

    this.player.teleportTo(this.target, () => {
      if (this.isCustomLevel) {
        this.restartGame()
      } else {
        transitionEventsEmitter.emit(EventKey.TransitionStart)
        transitionEventsEmitter.once(EventKey.TransitionEnd, () => this.scene.start(SceneKey.Levels), this)
      }
    })
  }

  die() {
    if (this.player.isDead) return
    this._canMove = false
    this.platformsCollider.active = false
    this.cannonsCollider.active = false
    this.oneWayPlatformsCollider.active = false
    this.enemiesCollider.active = false
    this.fallingBlocksCollider.active = false
    this.eventBlocksCollider.active = false
    this.fallingBlocksTriggersOverlap.active = false
    this.targetTrigger.active = false
    this.transformersTriggers.active = false
    this.coinsTriggers.active = false
    if (this.checkpointTrigger) {
      this.checkpointTrigger.active = false
    }
    if (this.boss) {
      this.bossCollider.active = false
    }
    this.cameras.main.stopFollow()
    this.audioManager.playSfx(AudioKey.SfxDeath)
    this.events.emit(EventKey.StopTimer)
    this.player.die()

    // Analytics
    this.trackProgression(ProgressionEventType.Fail)
    this.trackDesign(AnalyticsKey.PlayerDeath)

    this.time.delayedCall(1000, this.lose, [], this)
  }

  handlRestartToggle() {
    if (this.player.isDead) return
    this.restartGame()
  }

  restartGame() {
    if (this.isTransitionning) return

    this.isTransitionning = true
    transitionEventsEmitter.emit(EventKey.TransitionStart)
    transitionEventsEmitter.once(EventKey.TransitionEnd, () => this.scene.restart(), this)
  }

  lose() {
    this.restartGame()
  }

  addCoins() {
    this.coins = this.physics.add.staticGroup()
    const coinsPos = this.levelData.coins || []

    if (this.coinsCollected.length === 0) {
      const totalCoins = getLevelTotalCoins(this.currentLevel ?? this.levelData)
      this.coinsCollected = Array(totalCoins).fill(0)
    }

    let coinIndex = 0
    for (let i = 0; i < coinsPos.length; i++) {
      const { x, y, numX = 1, numY = 1 } = coinsPos[i]
      for (let j = 0; j < Math.max(numX, numY); j++) {
        coinIndex++
        if (this.coinsCollected[coinIndex - 1] === 1) continue

        const isHorizontal = numX >= numY
        const coin = new Coin(
          this,
          x + (isHorizontal ? TILE_SIZE * j : 0) + (TILE_SIZE - COIN_SIZE) / 2,
          y + (isHorizontal ? 0 : TILE_SIZE * j) + (TILE_SIZE - COIN_SIZE) / 2,
          coinIndex - 1
        )

        this.coins.add(coin)
      }
    }
  }

  addOneWayPlatform(group: Phaser.Physics.Arcade.Group, data: LevelOneWayPlatform) {
    const { x, y, width, points } = data
    const platform = new OneWayPlatform(this, x, y, width, points)
    group.add(platform)
  }

  stickPlayerToPlatform: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_: any, platform: any) => {
    if (!(platform as OneWayPlatform).isMoving || this.player.stickedPlatform) return
    this.player.stickedPlatform = platform
  }

  addSpikes(group: Phaser.Physics.Arcade.StaticGroup, data: LevelSpike) {
    const { x, y, dir = 0, num = 1 } = data

    for (let i = 0; i < num; i++) {
      const isVertical = dir === 1 || dir === 3
      const spike = new Spike(
        this,
        x + TILE_SIZE / 2 + (!isVertical ? TILE_SIZE * i : 0),
        y + TILE_SIZE / 2 + (isVertical ? TILE_SIZE * i : 0),
        dir
      )

      group.add(spike)
    }
  }

  addSpikyBall(group: Phaser.Physics.Arcade.Group, data: LevelSpikyBall) {
    const { x, y, points, startAt = 0 } = data
    let spikyBall

    // Création d'un path follower si des points sont définis
    if (points) {
      spikyBall = new MovingSpikyBall(this, x, y, points, startAt)
    } else {
      spikyBall = new SpikyBall(this, x, y)
    }

    group.add(spikyBall)
  }

  addEnemy(group: Phaser.Physics.Arcade.Group, data: LevelEnemy) {
    const { x, y, dir = 1, type = 1, jumps = 1 } = data
    let enemy

    if (type === 2) {
      enemy = this.add.sprite(x, y, TextureKey.Enemy2).setOrigin(0)
      enemy.setData('jumpCount', 0)
    } else {
      enemy = this.add.rectangle(x, y, 80, 80, 0xff004d).setOrigin(0)
    }

    enemy.setData('dir', dir)
    enemy.setData('type', type)

    this.physics.add.existing(enemy)
    if (type === 2) {
      const body = enemy.body as Phaser.Physics.Arcade.Body
      body.setCircle(enemy.displayWidth / 3)
      body.setOffset(enemy.displayWidth / 6, enemy.displayWidth / 3)
      this.time.addEvent({
        callbackScope: this,
        delay: ENEMY2_JUMP_DELAY,
        loop: true,
        callback: () => {
          let jumpCount = enemy.getData('jumpCount') + 1
          let dir = enemy.getData('dir')
          if (jumpCount > jumps) {
            dir *= -1
            jumpCount = 1
          }
          body.setVelocity(246 * dir, -1040)
          enemy.setData('jumpCount', jumpCount)
          enemy.setData('dir', dir)
        },
      })
    }

    group.add(enemy)
  }

  addEventBlock(group: Phaser.Physics.Arcade.StaticGroup, data: LevelEventBlock) {
    const { x, y, width = TILE_SIZE, height = TILE_SIZE } = data
    const eventBlock = new EventBlock(this, x, y, width, height)
    eventBlock.setOrigin(0)
    group.add(eventBlock)
  }

  addFallingBlock(
    group: Phaser.Physics.Arcade.StaticGroup,
    triggerGroup: Phaser.Physics.Arcade.StaticGroup,
    data: LevelFallingBlock
  ) {
    const { x, y, num = 1 } = data
    for (let i = 0; i < num; i++) {
      const fallingBlock = new FallingBlock(this, x + TILE_SIZE * i + 1, y)
      group.add(fallingBlock)
      const trigger = this.add.rectangle(x + TILE_SIZE * i, y - 1, TILE_SIZE, TILE_SIZE)
      trigger.setOrigin(0)
      trigger.setData('block', fallingBlock)
      triggerGroup.add(trigger)
    }
  }

  handleFallingBlockCollision: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    _: any,
    fallingBlockTrigger: any
  ) => {
    const fallingBlock = fallingBlockTrigger.getData('block') as FallingBlock
    if (!(this.player.body as Phaser.Physics.Arcade.Body).blocked.down || fallingBlockTrigger.getData('isTriggered'))
      return
    fallingBlockTrigger.setData('isTriggered', true)
    fallingBlock.fall()
  }

  handleCoin: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_: any, object: any) => {
    const coin = object as Coin
    this.coinsEmitter.setPosition(coin.x, coin.y)
    this.coinsEmitter.explode(8)
    this.events.emit(EventKey.CollectCoin)
    this.audioManager.playSfx(AudioKey.SfxCoin)
    this.coinsCollected[coin.collectedIndex] = 1

    this.trackDesign(AnalyticsKey.CoinCollected)

    coin.destroy()
  }

  handleBossCollision() {
    const hasCollidedFromAbove = isTouchingFromAbove(this.player, this.boss!)
    if (hasCollidedFromAbove && this.boss!.isHittable) {
      // Boss hit
      this.boss!.hit()
      this.player.jumpOffEnemy(BOSS_BOUNCE_VELOCITY)

      if (!this.boss!.isDead) {
        this.toggleOneWayPlatforms()
        this.time.delayedCall(5000, this.toggleOneWayPlatforms, undefined, this)
      }
    } else {
      this.die.call(this)
    }
  }

  toggleOneWayPlatforms() {
    if (this.player.isDead) return
    const isActive = !this.oneWayPlatformsCollider.active
    this.oneWayPlatformsCollider.active = isActive
    this.oneWayPlatforms.getChildren().forEach((platform) => {
      this.tweens.add({
        targets: platform,
        alpha: isActive ? 1 : 0.5,
        duration: 500,
      })
    })
  }

  handleEnemiesCollision: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_: any, object: any) => {
    const enemy = object as Phaser.GameObjects.Sprite
    if (this.player.isDead || enemy.getData('isDead')) return

    const hasCollidedFromAbove = isTouchingFromAbove(this.player, enemy)
    if (hasCollidedFromAbove && enemy.getData('type') === 1) {
      enemy.setData('isDead', true)
      ;(enemy.body as Phaser.Physics.Arcade.Body).setVelocityX(0)

      this.tweens.add({
        targets: enemy,
        duration: 300,
        scale: 0,
        ease: 'Back.In',
        onComplete: () => {
          enemy.destroy()
        },
      })

      this.player.jumpOffEnemy()

      // Analytics
      this.trackDesign(AnalyticsKey.EnemyKilled)

      return
    }

    this.die.call(this)
  }

  trackProgression(type: ProgressionEventType) {
    if (this.isCustomLevel || !this.currentLevel) {
      return
    }
    addProgressionEvent(type, 1, this.currentLevel)
  }

  trackDesign(name: AnalyticsKey) {
    if (this.isCustomLevel) {
      return
    }
    addDesignEvent(name)
  }

  handleCheckpoint() {
    if (this.isCheckpointActive || this.player.isDead) return
    this.isCheckpointActive = true
    this.checkpointTrigger.active = false
    this.registry.set(DataKey.IsCheckpointActive, true)
    this.registry.set(DataKey.CoinsCollected, [...this.coinsCollected])

    this.audioManager.playSfx(AudioKey.SfxCheckpoint)
    this.tweens.add({
      targets: this.checkpointFlag,
      y: this.checkpointFlag.y - 120,
      duration: 1000,
      ease: 'Cubic.Out',
    })
  }

  handleTransformerCheck: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_: any, object: any) => {
    const transformer = object as Phaser.GameObjects.GameObject
    if (this._playerMode === transformer.getData('mode')) return

    this._playerMode = this._playerMode === PlayerMode.Platformer ? PlayerMode.Flappy : PlayerMode.Platformer
    if (this._playerMode === PlayerMode.Flappy) {
      this.player.enterFlappyMode()
    } else {
      this.tweens.add({
        targets: this.player.sprite,
        angle: 0,
        duration: 200,
        ease: 'Cubic.easeOut',
      })
    }
  }

  handleMovingPlatforms(_: number, delta: number) {
    // Reset du stick plateforme
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    this.stickedPlatform = this.player.stickedPlatform
    this.stickedVelocityX = 0
    if (this.stickedPlatform && !playerBody.touching.down) {
      this.stickedPlatform = null
      this.player.stickedPlatform = null
    }

    this.oneWayPlatforms
      .getChildren()
      .filter((platform) => (platform as OneWayPlatform).isMoving)
      .forEach((object) => {
        const platform = object as OneWayPlatform
        const previousX = platform.x
        const follower = platform.follower!
        follower.path.getPoint(follower.t, follower.vec)
        const deltaX = follower.vec.x - platform.x
        const deltaY = follower.vec.y - platform.y
        platform.setPosition(follower.vec.x, follower.vec.y)
        follower.t += delta / 5000
        if (follower.t >= 1) {
          follower.t = 0
        }

        // Déplacement du joueur avec la plateforme
        if (this.stickedPlatform === platform) {
          this.player.y += deltaY
          this.stickedVelocityX = (platform.x - previousX) / (delta / 1000)
          if (playerBody.velocity.x === 0) {
            this.player.x += deltaX

            // Détection à la main des collisions
            if (
              this.player.x - playerBody.halfWidth < this.stickedPlatform.x ||
              this.player.x + playerBody.halfWidth > this.stickedPlatform.x
            ) {
              const x =
                this.stickedVelocityX > 0
                  ? this.player.x + playerBody.halfWidth
                  : this.player.x - playerBody.halfWidth - 10
              const rectDetection = new Phaser.Geom.Rectangle(x, this.player.y, 10, playerBody.halfHeight)
              const collidingPlatforms = this.platforms
                .getChildren()
                .filter((platform) =>
                  Phaser.Geom.Intersects.RectangleToRectangle(
                    rectDetection,
                    (platform as Phaser.GameObjects.Sprite).getBounds()
                  )
                )

              if (collidingPlatforms.length) {
                const platformToCheck = collidingPlatforms[0] as Phaser.GameObjects.Sprite
                if (this.stickedVelocityX > 0 && this.player.x + playerBody.halfWidth > platformToCheck.x) {
                  this.player.x = platformToCheck.x - playerBody.halfWidth
                } else if (
                  this.stickedVelocityX < 0 &&
                  this.player.x - playerBody.halfWidth < platformToCheck.x + platformToCheck.width
                ) {
                  this.player.x = platformToCheck.x + platformToCheck.width + playerBody.halfWidth
                }
              }
            }
          }
        }
      })
  }
}
