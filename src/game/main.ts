import Phaser from 'phaser'
import ga from 'gameanalytics'
import { GameConfig } from './config'

ga.GameAnalytics.setEnabledInfoLog(true)
ga.GameAnalytics.configureBuild('0.0.15')
// ga.GameAnalytics.initialize('xxx', 'xxx')

const mountGame = (parent: string) => {
  return new Phaser.Game({ ...GameConfig, parent })
}

export default mountGame
