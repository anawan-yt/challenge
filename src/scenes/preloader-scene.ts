import AudioKey from '../consts/audio-key'
import SceneKey from '../consts/scene-key'
import TextureKey from '../consts/texture-key'

export default class PreloaderScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics

  constructor() {
    super({ key: SceneKey.Preloader })
  }

  preload() {
    this.load.setBaseURL('assets')
    const graphics = this.make.graphics()

    // Particles and other elements
    graphics.fillStyle(0x181425, 1)
    graphics.fillRect(0, 0, 20, 20)
    graphics.generateTexture(TextureKey.Particle, 20, 20)
    graphics.clear()

    graphics.fillStyle(0xffffff, 0.4)
    graphics.fillRect(0, 0, 20, 20)
    graphics.generateTexture(TextureKey.ParticleTransformer, 20, 20)
    graphics.clear()

    graphics.fillStyle(0xe43b44, 0.4)
    graphics.fillRect(0, 0, 20, 20)
    graphics.generateTexture(TextureKey.ParticleLava, 20, 20)
    graphics.clear()

    graphics.fillStyle(0xc0cbdc, 1)
    graphics.fillCircle(20, 20, 20)
    graphics.generateTexture(TextureKey.ParticleJump, 40, 40)
    graphics.clear()

    graphics.fillStyle(0xfee761, 1)
    graphics.fillRect(0, 0, 20, 20)
    graphics.generateTexture(TextureKey.ParticleCoin, 20, 20)
    graphics.clear()

    graphics.fillStyle(0xf77622, 1)
    graphics.fillCircle(20, 20, 20)
    graphics.generateTexture(TextureKey.Fireball, 40, 40)
    graphics.clear()

    graphics.fillStyle(0xc0cbdc, 1)
    graphics.beginPath()
    graphics.moveTo(40, 2)
    graphics.lineTo(78, 40)
    graphics.lineTo(40, 78)
    graphics.lineTo(2, 40)
    graphics.closePath()
    graphics.fillPath()
    graphics.fillStyle(0x181425, 1)
    graphics.fillCircle(40, 40, 30)
    graphics.generateTexture(TextureKey.SpikyBall, 80, 80)
    graphics.clear()

    graphics.fillStyle(0xffffff, 1)
    graphics.fillCircle(60, 60, 60)
    graphics.fillCircle(100, 100, 60)
    graphics.fillCircle(140, 60, 60)
    graphics.fillCircle(180, 100, 60)
    graphics.fillCircle(240, 60, 60)
    graphics.generateTexture(TextureKey.Cloud, 300, 240)
    graphics.destroy()

    this.load.spritesheet(TextureKey.Icons, 'icons.png', {
      frameWidth: 80,
      frameHeight: 80,
    })

    this.load.spritesheet(TextureKey.BtnIcon, 'icon-btn.png', {
      frameWidth: 80,
      frameHeight: 80,
    })

    this.load.spritesheet(TextureKey.BtnText, 'text-btn.png', {
      frameWidth: 480,
      frameHeight: 120,
    })

    this.load.image(TextureKey.BtnCursor, 'btn-cursor.png')
    this.load.image(TextureKey.Spike, 'spike.png')
    this.load.image(TextureKey.Enemy2, 'enemy2.png')
    this.load.image(TextureKey.Hill, 'bg-hills.png')
    this.load.image(TextureKey.Hill2, 'bg-hills2.png')
    this.load.image(TextureKey.Volcanos, 'bg-volcanos.png')
    this.load.image(TextureKey.Volcanos2, 'bg-volcanos2.png')
    this.load.image(TextureKey.Bump, 'bump.png')
    this.load.image(TextureKey.Grid2, 'grid2.png')

    this.load.audio(AudioKey.Music, 'audio/music.mp3')
    this.load.audio(AudioKey.SfxJump, 'audio/sfx-jump.mp3')
    this.load.audio(AudioKey.SfxHit, 'audio/sfx-hit.mp3')
    this.load.audio(AudioKey.SfxDeath, 'audio/sfx-death.mp3')
    this.load.audio(AudioKey.SfxWin, 'audio/sfx-win.mp3')
    this.load.audio(AudioKey.SfxCoin, 'audio/sfx-coin.mp3')
    this.load.audio(AudioKey.SfxCheckpoint, 'audio/sfx-checkpoint.mp3')
    this.load.audio(AudioKey.SfxUnlock, 'audio/sfx-unlock.mp3')
    this.load.audio(AudioKey.SfxButton, 'audio/sfx-button.mp3')
    this.load.audio(AudioKey.SfxShake, 'audio/sfx-shake.mp3')

    const { width, height } = this.scale
    this.add
      .text(width / 2, height / 2 - 48, 'Chargement...', {
        fontFamily: TextureKey.FontHeading,
        fontSize: '48px',
        color: '#262b44',
      })
      .setOrigin(0.5, 0.5)

    const progressBox = this.add.graphics()
    progressBox.lineStyle(8, 0x262b44)
    progressBox.strokeRect(width / 2 - 204, height / 2, 408, 80)

    this.progressBar = this.add.graphics()
    this.load.on('progress', this.onProgress, this)
  }

  create() {
    this.scene.start(SceneKey.Intro)
  }

  onProgress(val: number) {
    const { width, height } = this.scale
    const [progressWidth, progressHeight] = [400, 76]

    this.progressBar.clear()
    this.progressBar.fillStyle(0x262b44, 1)
    this.progressBar.fillRect(width / 2 - progressWidth / 2, height / 2, progressWidth * val, progressHeight)
  }
}
