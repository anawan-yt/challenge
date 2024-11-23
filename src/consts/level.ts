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
  isBoss?: boolean
  bossTrigger?: BossTrigger
  world: LevelSize
  player: LevelPosition
  target: LevelPosition
  checkpoint?: LevelPosition
  hills?: LevelPosition[]
  hillsFront?: LevelPosition[]
  clouds?: LevelClouds
  platforms: LevelPlatform[]
  oneWayPlatforms?: LevelOneWayPlatform[]
  transformers?: LevelTransformer[]
  fallingBlocks?: LevelFallingBlock[]
  coins?: LevelCoin[]
  enemies?: LevelEnemy[]
  spikyBalls?: LevelSpikyBall[]
  spikes?: LevelSpike[]
  cannons?: LevelCannon[]
  eventBlocks?: LevelEventBlock[]
}

export interface LevelPosition {
  x: number
  y: number
}

export interface LevelSize {
  width: number
  height: number
}

export interface LevelClouds {
  y: {
    min: number
    max: number
  }
  x: number[]
}

export interface LevelPlatform extends LevelPosition, LevelSize {}
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
