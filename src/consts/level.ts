import TextureKey from './texture-key'

export enum GameMode {
  Classic = 'classic',
  Speedrun = 'speedrun',
}

export interface PlayerDataLevel {
  level: number
  time: number
  coins?: number
  shinyCoin?: boolean
}

export interface DataLevels {
  [key: string]: DataLevel
}

export interface DataLevel {
  theme?: Theme
  isBoss?: boolean
  bossTrigger?: BossTrigger
  world: LevelSize
  player: LevelPosition
  target: LevelPosition
  checkpoint?: LevelPosition
  platforms: LevelPlatform[]
  lava?: LevelLava[]
  lavaBalls?: LevelLavaBall[]
  oneWayPlatforms?: LevelOneWayPlatform[]
  transformers?: LevelTransformer[]
  fallingBlocks?: LevelFallingBlock[]
  coins?: LevelCoin[]
  enemies?: LevelEnemy[]
  spikyBalls?: LevelSpikyBall[]
  spikes?: LevelSpike[]
  cannons?: LevelCannon[]
  bumps?: LevelBump[]
  eventBlocks?: LevelEventBlock[]
}

export enum Theme {
  Forest = 'forest',
  Volcano = 'volcano',
}

export interface ThemeColors {
  background: number
  platform: number
  parallax: TextureKey
  parallax2: TextureKey
}

export const THEME_DATA: Record<Theme, ThemeColors> = {
  [Theme.Forest]: {
    background: 0x0099db,
    platform: 0xbe4a2f,
    parallax: TextureKey.Hill,
    parallax2: TextureKey.Hill2,
  },
  [Theme.Volcano]: {
    background: 0xbe4a2f,
    platform: 0xa22633,
    parallax: TextureKey.Volcanos,
    parallax2: TextureKey.Volcanos2,
  },
}

export interface WorldTheme {
  gridTexture: TextureKey
  dir: Phaser.Math.Vector2
  button: number
}

export const WORLD_THEMES: Array<WorldTheme> = [
  {
    gridTexture: TextureKey.Grid,
    dir: new Phaser.Math.Vector2(0.5, 0.5),
    button: 0x262b44,
  },
  {
    gridTexture: TextureKey.Grid2,
    dir: new Phaser.Math.Vector2(0, -0.5),
    button: 0x3e2731,
  },
]

export interface LevelPosition {
  x: number
  y: number
}

export interface LevelSize {
  width: number
  height: number
}

export interface LevelPlatform extends LevelPosition, LevelSize {}
export interface LevelLava extends LevelPosition, LevelSize {}
export interface LevelItem extends LevelPosition, LevelSize {}
export interface BossTrigger extends LevelPosition, LevelSize {}
export interface LevelEventBlock extends LevelPosition, Partial<LevelSize> {}

export interface LevelOneWayPlatform extends LevelPosition, Pick<LevelSize, 'width'> {
  points?: LevelPosition[]
}

export interface LevelTransformer extends LevelPosition, Partial<LevelSize> {
  mode?: string
}

export interface LevelFallingBlock extends LevelPosition {
  num?: number
}

export interface LevelCoin extends LevelPosition {
  numX?: number
  numY?: number
}

export interface LevelEnemy extends LevelPosition {
  dir?: number
  type?: number
  jumps?: number
}

export interface LevelSpikyBall extends LevelPosition {
  startAt?: number
  points?: LevelPosition[]
}

export interface LevelSpike extends LevelPosition {
  num?: number
  dir?: number
}

export interface LevelCannon extends LevelPosition {
  dir?: number
}

export interface LevelBump extends LevelPosition {}
export interface LevelLavaBall extends LevelPosition {}
