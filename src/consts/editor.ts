import Cannon from '../objects/cannon'
import FallingBlock from '../objects/falling-block'
import MovingSpikyBall from '../objects/moving-spiky-ball'
import Platform from '../objects/platform'
import Spike from '../objects/spike'
import SpikyBall from '../objects/spiky-ball'
import IconButton from '../objects/ui/icon-button'
import { LevelCannon, LevelFallingBlock, LevelPlatform, LevelSpike, LevelSpikyBall } from './level'

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
}

export enum EditorTool {
  Delete = 'delete',
  Rotate = 'rotate',
}

export const EDITOR_TYPE_TOOLS: Partial<Record<EditorType, EditorTool[]>> = {
  [EditorType.Spike]: [EditorTool.Rotate],
  [EditorType.Cannon]: [EditorTool.Rotate],
}

export interface EditorPlaceItemProps {
  worldX: number
  worldY: number
  item: EditorType
  dir?: number
}

export interface EditorPlaceAtItemProps {
  item: EditorType
  dir?: number
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
  [key in EditorTool]: IconButton
}

export interface EditorItemBase<TObject, TData> {
  type: EditorType
  object: TObject
  data: TData
}

export interface EditorPlatform extends EditorItemBase<Platform, LevelPlatform> {
  type: EditorType.Platform
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

export type EditorItem = EditorPlatform | EditorSpike | EditorFallingBlock | EditorSpikyBall | EditorCannon
