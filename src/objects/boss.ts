import AudioKey from '../consts/audio-key'
import EventKey from '../consts/event-key'
import { ENEMY_VELOCITY } from '../consts/globals'
import SceneKey from '../consts/scene-key'
import AudioScene from '../scenes/audio-scene'
import GameScene from '../scenes/game-scene'

const [startX, startY] = [2120, 1240]
const MAX_LIVES = 3

export default class Boss extends Phaser.GameObjects.Rectangle {
  private _isHittable = false
  private _isDead = false
  private dir: number
  private currentVelocity: number
  private isMoving = false
  private lives = MAX_LIVES
  private canShakeScreen = true

  get isDead() {
    return this._isDead
  }

  get isHittable() {
    return this._isHittable
  }

  constructor(scene: Phaser.Scene) {
    super(scene, startX, startY, 400, 400, 0xff0044)
    scene.physics.world.enable(this)
    scene.add.existing(this)
    this.dir = 1
    const body = this.body as Phaser.Physics.Arcade.Body
    body.allowGravity = false
    this.currentVelocity = ENEMY_VELOCITY
    this.setVisible(false)
  }

  update() {
    if (this._isDead) return

    const body = this.body as Phaser.Physics.Arcade.Body
    if (this.canShakeScreen && body.blocked.down) {
      this.canShakeScreen = false
      this.scene.cameras.main.shake(600, 0.01)
      ;(this.scene.scene.get(SceneKey.Audio) as AudioScene).playSfx(AudioKey.SfxShake)
    }

    if (!this.isMoving) return

    if (body.blocked.right) {
      this.dir = -1
    } else if (body.blocked.left) {
      this.dir = 1
    }

    body.setVelocityX(this.currentVelocity * this.dir)
  }

  hit() {
    const body = this.body as Phaser.Physics.Arcade.Body
    this.lives--
    body.velocity.x = 0
    this.isMoving = false
    this._isHittable = false
    this.isMoving = false

    if (this.lives === 0) {
      this.die()
    } else {
      body.allowGravity = false
      this.currentVelocity *= 1.3

      this.scene.add
        .timeline([
          {
            at: 0,
            tween: {
              targets: this,
              duration: 500,
              scale: 0,
              ease: 'Back.In',
              onComplete: () => {
                this.x = startX
                this.y = startY
              },
            },
          },
          {
            at: 800,
            tween: {
              targets: this,
              duration: 500,
              scale: 1,
              ease: 'Cubic.easeOut',
              onComplete: () => {
                this.fall()
              },
            },
          },
        ])
        .play()
    }
  }

  fall() {
    const body = this.body as Phaser.Physics.Arcade.Body
    body.allowGravity = true
    this.canShakeScreen = true
    this.setVisible(true)
    this.scene.time.delayedCall(1500, () => {
      this.isMoving = true
      this._isHittable = true

      if (this.lives === MAX_LIVES) {
        this.scene.events.emit(EventKey.UnfreezePlayer)
      } else {
        this.dir = Math.sign((this.scene as GameScene).playerRef.x - this.x)
      }
    })
  }

  die() {
    this._isDead = true
    this.scene.events.emit(EventKey.UnlockEventBlocks)
    this.scene.tweens.add({
      targets: this,
      duration: 500,
      scale: 0,
      ease: 'Back.In',
      onComplete: () => {
        this.destroy()
      },
    })
  }
}
