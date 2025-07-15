import BootScene from './scenes/boot-scene'
import BackgroundScene from './scenes/background-scene'
import PreloaderScene from './scenes/preloader-scene'
import IntroScene from './scenes/intro-scene'
import TransitionScene from './scenes/transition-scene'
import AudioScene from './scenes/audio-scene'
import SettingsScene from './scenes/settings-scene'
import LevelsScene from './scenes/levels-scene'
import HUDScene from './scenes/hud-scene'
import EditorScene from './scenes/editor-scene'
import GameScene from './scenes/game-scene'

export const GameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Hey Bobby',
  version: '0.0.16',
  parent: 'game',
  type: Phaser.AUTO,
  backgroundColor: '#0099db',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 1080,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        x: 0,
        y: 3200,
      },
    },
  },
  input: {
    activePointers: 3,
  },
  scene: [
    BootScene,
    BackgroundScene,
    PreloaderScene,
    IntroScene,
    LevelsScene,
    GameScene,
    HUDScene,
    EditorScene,
    TransitionScene,
    AudioScene,
    SettingsScene,
  ],
}
