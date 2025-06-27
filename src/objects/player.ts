import AudioKey from '../consts/audio-key'
import {
  PLAYER_BOUNCE_OFF_VELOCITY,
  PLAYER_BUFFERING_TIME,
  PLAYER_COYOTE_TIME,
  PLAYER_DEATH_JUMP_X,
  PLAYER_DEATH_JUMP_Y,
  PLAYER_FALL_SQUASH_VELOCITY,
  PLAYER_FLAPPY_VELOCITY,
  PLAYER_MAX_JUMP_TIME,
  PLAYER_MAX_JUMP_VELOCITY,
  PLAYER_MAX_JUMPS,
  PLAYER_MIN_JUMP_VELOCITY,
  PLAYER_VELOCITY,
  PlayerMode,
  PLAYER_SIZE,
} from '../consts/globals'
import TextureKey from '../consts/texture-key'
import GameScene from '../scenes/game-scene'
import OneWayPlatform from './one-way-platform'

interface PlayerUpdateParams {
  time: number
  isGoingLeft: boolean
  isGoingRight: boolean
  stickedVelocityX: number
  playerMode: PlayerMode
  justTriggeredJump: boolean
}

export default class Player extends Phaser.GameObjects.Container {
  private _sprite!: Phaser.GameObjects.Rectangle
  private _isDead = false
  private dir = 1
  private prevVelocityY = 0
  private playerWasStanding = false
  private fallStartTime = 0
  private jumpCount = 0
  private isUpKeyPressed = false
  private jumpStartTime = 0
  private isJumping = false
  private jumpBufferingTime = 0
  private emitter!: Phaser.GameObjects.Particles.ParticleEmitter
  public stickedPlatform: OneWayPlatform | null

  get sprite() {
    return this._sprite
  }

  get isDead() {
    return this._isDead
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)
    this._sprite = scene.add.rectangle(0, 0, PLAYER_SIZE, PLAYER_SIZE, 0xfff1e8)
    this.stickedPlatform = null
    this.add(this._sprite)
    this.setSize(PLAYER_SIZE, PLAYER_SIZE)
    scene.physics.world.enable(this)
    scene.add.existing(this)

    // Particules du joueur lors du saut
    this.emitter = scene.add.particles(0, 0, TextureKey.ParticleJump, {
      lifespan: 300,
      speedX: { min: -200, max: 200 },
      speedY: 0,
      scale: { start: 1, end: 0 },
      emitting: false,
      quantity: 5,
    })
  }

  update(params: PlayerUpdateParams) {
    this.resetVelocity()
    const { time, isGoingLeft, isGoingRight, stickedVelocityX, playerMode, justTriggeredJump } = params
    const body = this.body as Phaser.Physics.Arcade.Body

    if (isGoingLeft) {
      body.setVelocityX(-PLAYER_VELOCITY + (stickedVelocityX < 0 ? stickedVelocityX : 0))
    } else if (isGoingRight) {
      body.setVelocityX(PLAYER_VELOCITY + (stickedVelocityX > 0 ? stickedVelocityX : 0))
    }

    if (playerMode === PlayerMode.Platformer) {
      // Détection de chute pour coyote time
      if (this.playerWasStanding && !body.blocked.down) {
        this.playerWasStanding = false
        this.fallStartTime = this.scene.time.now
      } else if (
        !this.playerWasStanding &&
        this.jumpCount === 0 &&
        this.scene.time.now - this.fallStartTime >= PLAYER_COYOTE_TIME
      ) {
        this.jumpCount = 1
      } else if (!this.playerWasStanding && body.blocked.down && body.velocity.y === 0 && !justTriggeredJump) {
        this.playerWasStanding = true
        this.jumpCount = 0

        if (this.prevVelocityY >= PLAYER_FALL_SQUASH_VELOCITY) {
          this.completePlayerTweens()
          this.emitter.emitParticleAt(this.x, this.y + 24)
          this.scene.tweens.add({
            targets: this._sprite,
            scaleY: 0.6,
            scaleX: 1.4,
            y: 16,
            duration: 150,
            yoyo: true,
            ease: 'Cubic.easeOut',
          })
        }
      }

      // Jump buffering
      if (this.isUpKeyPressed && body.blocked.down && time - this.jumpBufferingTime < PLAYER_BUFFERING_TIME) {
        this.jump()
      }

      // Gérer le saut progressif
      if (this.isJumping && this.isUpKeyPressed) {
        let pressDuration = time - this.jumpStartTime
        if (pressDuration > PLAYER_MAX_JUMP_TIME) {
          this.isJumping = false
          pressDuration = PLAYER_MAX_JUMP_TIME
        }

        const t = pressDuration / PLAYER_MAX_JUMP_TIME
        const jumpVelocity =
          PLAYER_MIN_JUMP_VELOCITY + (PLAYER_MAX_JUMP_VELOCITY - PLAYER_MIN_JUMP_VELOCITY) * Math.pow(t, 2)
        body.setVelocityY(jumpVelocity)
      }
    } else {
      const { y } = body.velocity

      if (y < 0) {
        this._sprite.angle = -20 * this.dir
      } else if (y > 1000) {
        this._sprite.angle = 90 * this.dir
      } else {
        this._sprite.angle = ((y * 90) / 1000) * this.dir
      }
    }

    if (justTriggeredJump) {
      this.jump()
    }
  }

  resetVelocity() {
    const body = this.body as Phaser.Physics.Arcade.Body
    if (body.velocity.x !== 0) {
      this.dir = Math.sign(body.velocity.x)
      body.setVelocityX(0)
    }

    if (body.velocity.y !== 0) {
      this.prevVelocityY = body.velocity.y
    }
  }

  completePlayerTweens() {
    this.scene.tweens.killTweensOf(this._sprite)
    this._sprite.setScale(1)
    this._sprite.angle = 0
    this._sprite.y = 0
  }

  resetJump() {
    if (!(this.scene as GameScene).canMove) return
    this.isUpKeyPressed = false
    this.isJumping = false
  }

  flappyJump() {
    ;(this.scene as GameScene).audioManager.playSfx(AudioKey.SfxJump)
    this.emitter.emitParticleAt(this.x, this.y + 24)
    ;(this.body as Phaser.Physics.Arcade.Body).setVelocityY(PLAYER_FLAPPY_VELOCITY)
  }

  jump() {
    const scene = this.scene as GameScene
    if (!scene.canMove) return
    if (scene.playerMode === PlayerMode.Flappy) {
      return this.flappyJump()
    }

    this.isUpKeyPressed = true
    const playerBody = this.body as Phaser.Physics.Arcade.Body
    const isGrounded = playerBody.blocked.down && playerBody.velocity.y === 0

    const shouldDoubleJump = !isGrounded && this.jumpCount > 0 && this.jumpCount < PLAYER_MAX_JUMPS
    let playerAlmostLanded = false
    if (shouldDoubleJump && playerBody.velocity.y > 0) {
      playerAlmostLanded = scene.checkPlayerRightAbovePlatform()
    }

    if (
      isGrounded ||
      (!isGrounded && this.scene.time.now - this.fallStartTime < PLAYER_COYOTE_TIME && this.jumpCount === 0) ||
      (shouldDoubleJump && !playerAlmostLanded)
    ) {
      this.jumpCount++
      this.isJumping = true
      this.jumpStartTime = this.scene.time.now
      this.completePlayerTweens()
      ;(this.scene as GameScene).audioManager.playSfx(AudioKey.SfxJump)

      if (this.jumpCount === 1) {
        this.scene.tweens.add({
          targets: this._sprite,
          scaleY: 1.4,
          scaleX: 0.6,
          y: -8,
          duration: 200,
          yoyo: true,
          ease: 'Cubic.easeOut',
        })
      } else {
        this.emitter.emitParticleAt(this.x, this.y + 24)
        this.scene.tweens.add({
          targets: this._sprite,
          angle: 360 * this.dir,
          duration: 600,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            this.angle = 0
          },
        })
      }
    } else {
      this.jumpBufferingTime = this.scene.time.now
    }
  }

  enterFlappyMode() {
    this.jumpCount = 1
  }

  jumpOffObstacle(velocityY: number = PLAYER_BOUNCE_OFF_VELOCITY) {
    ;(this.body as Phaser.Physics.Arcade.Body).setVelocityY(-velocityY)
    this.jumpCount = 1
    this.isJumping = true
    this.jumpStartTime = this.scene.time.now
    this.isUpKeyPressed = false
    this.playerWasStanding = true
    ;(this.scene as GameScene).audioManager.playSfx(AudioKey.SfxHit)
  }

  die() {
    this._isDead = true
    ;(this.body as Phaser.Physics.Arcade.Body).setVelocity(PLAYER_DEATH_JUMP_X * this.dir * -1, PLAYER_DEATH_JUMP_Y)
  }

  teleportTo(target: Phaser.GameObjects.Arc, onComplete: Function) {
    const timeline = this.scene.add.timeline([
      {
        at: 0,
        tween: {
          targets: this.sprite,
          angle: 540 * this.dir,
          delay: 200,
          duration: 600,
          scale: 0.5,
          x: target.x - this.x,
          y: target.y - this.y,
        },
      },
      {
        at: 1200,
        tween: {
          targets: this.sprite,
          duration: 300,
          scale: 0,
          alpha: 0,
          ease: 'Cubic.In',
        },
      },
      {
        at: 900,
        tween: {
          targets: target,
          duration: 300,
          scale: 1.6,
          ease: 'Cubic.Out',
        },
      },
      {
        at: 1200,
        tween: {
          targets: target,
          duration: 300,
          scale: 0,
          ease: 'Cubic.In',
          onComplete: () => onComplete(),
        },
      },
    ])
    timeline.play()
  }
}
