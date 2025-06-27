import Bump from '../objects/bump'
import Cannon from '../objects/cannon'
import Coin from '../objects/coin'
import FallingBlock from '../objects/falling-block'
import MovingSpikyBall from '../objects/moving-spiky-ball'
import OneWayPlatform from '../objects/one-way-platform'
import Platform from '../objects/platform'
import Spike from '../objects/spike'
import SpikyBall from '../objects/spiky-ball'
import IconButton from '../objects/ui/icon-button'
import NumberChoice from '../objects/ui/number-choice'
import {
  LevelBump,
  LevelCannon,
  LevelCoin,
  LevelEnemy,
  LevelFallingBlock,
  LevelOneWayPlatform,
  LevelPlatform,
  LevelSpike,
  LevelSpikyBall,
} from './level'

export enum EditorMode {
  Select = 'select',
  Move = 'move',
  Draw = 'draw',
  Rect = 'rect',
  Eraser = 'eraser',
}

export enum EditorType {
  Platform = 'platform',
  Bobby = 'bobby',
  Target = 'target',
  Spike = 'spike',
  FallingBlock = 'fallingBlock',
  SpikyBall = 'spikyBall',
  Cannon = 'cannon',
  OneWayPlatform = 'oneWayPlatform',
  Enemy = 'enemy',
  Bump = 'bump',
  Coin = 'coin',
}

export enum EditorTool {
  Delete = 'delete',
  Rotate = 'rotate',
  MoveX = 'moveX',
  MoveY = 'moveY',
  StartAt = 'startAt',
  Direction = 'direction',
}

export const EDITOR_TYPE_TOOLS: Partial<Record<EditorType, EditorTool[]>> = {
  [EditorType.Spike]: [EditorTool.Rotate],
  [EditorType.Cannon]: [EditorTool.Rotate],
  [EditorType.Enemy]: [EditorTool.Direction],
  [EditorType.SpikyBall]: [EditorTool.MoveX, EditorTool.MoveY, EditorTool.StartAt],
}

export interface EditorPoint {
  x: number
  y: number
}

export interface EditorPlaceItemProps {
  worldX: number
  worldY: number
  type: EditorType
  dir?: number
}

export interface EditorPlaceAtItemProps {
  type: EditorType
  dir?: number
  points?: EditorPoint[]
  startAt?: number
}

export interface EditorPlaceItemProps extends EditorPlaceAtItemProps {
  worldX: number
  worldY: number
}

export interface EditorSelectItemProps {
  worldX: number
  worldY: number
}

export interface EditorRemoveItemProps {
  worldX: number
  worldY: number
}

export interface EditorPlaceItemsProps extends EditorPlaceItemProps {
  cols: number
  rows: number
}

export interface EditorRectInfo {
  worldX: number
  worldY: number
  cols: number
  rows: number
}

export type EditorModeButtons = {
  [key in EditorMode]: IconButton
}

export type EditorTypeButtons = {
  [key in EditorType]: {
    btn: IconButton
    isMulti: boolean
  }
}

export type EditorToolButtons = {
  [key in EditorTool]: IconButton | NumberChoice
}

export interface EditorItemBase<TObject, TData> {
  type: EditorType
  object: TObject
  data: TData
}

export interface EditorPlatform extends EditorItemBase<Platform, LevelPlatform> {
  type: EditorType.Platform
}

export interface EditorOneWayPlatform extends EditorItemBase<OneWayPlatform, LevelOneWayPlatform> {
  type: EditorType.OneWayPlatform
}

export interface EditorSpike extends EditorItemBase<Spike, LevelSpike> {
  type: EditorType.Spike
}

export interface EditorFallingBlock extends EditorItemBase<FallingBlock, LevelFallingBlock> {
  type: EditorType.FallingBlock
}

export interface EditorSpikyBall extends EditorItemBase<SpikyBall | MovingSpikyBall, LevelSpikyBall> {
  type: EditorType.SpikyBall
}

export interface EditorCannon extends EditorItemBase<Cannon, LevelCannon> {
  type: EditorType.Cannon
}

export interface EditorEnemy
  extends EditorItemBase<Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle, LevelEnemy> {
  type: EditorType.Enemy
}

export interface EditorBump extends EditorItemBase<Bump, LevelBump> {
  type: EditorType.Bump
}

export interface EditorCoin extends EditorItemBase<Coin, LevelCoin> {
  type: EditorType.Coin
}

export type EditorItem =
  | EditorPlatform
  | EditorSpike
  | EditorFallingBlock
  | EditorSpikyBall
  | EditorCannon
  | EditorOneWayPlatform
  | EditorEnemy
  | EditorBump
  | EditorCoin
