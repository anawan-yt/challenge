import IconButton from '../objects/ui/icon-button'

export enum EditorMode {
  Move = 'move',
  Draw = 'draw',
  Rect = 'rect',
  Eraser = 'eraser',
}

export enum EditorItem {
  Platform = 'platform',
  Bobby = 'bobby',
  Target = 'target',
  Spike = 'spike',
  FallingBlock = 'fallingBlock',
}

export interface EditorPlaceItemProps {
  worldX: number
  worldY: number
  item: EditorItem
  dir?: number
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

export type EditorItemButtons = {
  [key in EditorItem]: {
    btn: IconButton
    isMulti: boolean
  }
}
