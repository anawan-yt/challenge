import AudioKey from '../consts/audio-key'
import DataKey from '../consts/data-key'
import SceneKey from '../consts/scene-key'

interface SoundMap {
  [key: string]: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound
}

export default class AudioScene extends Phaser.Scene {
  private backgroundMusic!: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound
  private sfx!: SoundMap

  constructor() {
    super({ key: SceneKey.Audio })
  }

  create() {
    const isMute = localStorage.getItem(DataKey.Mute) === 'true' ? true : false
    this.registry.set(DataKey.Mute, isMute)
    this.sound.mute = isMute

    if (!this.sound.get(AudioKey.Music)) {
      this.backgroundMusic = this.sound.add(AudioKey.Music, {
        loop: true,
      })
      this.playMusic()

      const sfxJump = this.sound.add(AudioKey.SfxJump, { volume: 0.5 })
      const sfxHit = this.sound.add(AudioKey.SfxHit)
      const sfxDeath = this.sound.add(AudioKey.SfxDeath)
      const sfxWin = this.sound.add(AudioKey.SfxWin)
      const sfxCheckpoint = this.sound.add(AudioKey.SfxCheckpoint)
      const sfxCoin = this.sound.add(AudioKey.SfxCoin)
      const sfxUnlock = this.sound.add(AudioKey.SfxUnlock)
      const sfxButton = this.sound.add(AudioKey.SfxButton)
      const sfxShake = this.sound.add(AudioKey.SfxShake)

      this.sfx = {
        sfxJump,
        sfxHit,
        sfxDeath,
        sfxWin,
        sfxCoin,
        sfxCheckpoint,
        sfxUnlock,
        sfxButton,
        sfxShake,
      }
    }
  }

  playSfx(key: string) {
    this.sfx[key]?.play()
  }

  playMusic() {
    this.backgroundMusic.play()
  }

  pauseMusic() {
    this.backgroundMusic.pause()
  }

  toggleMute() {
    const isMute = this.registry.get(DataKey.Mute) as boolean
    this.sound.mute = !isMute
    this.registry.set(DataKey.Mute, !isMute)
    localStorage.setItem(DataKey.Mute, (!isMute).toString())
  }
}
