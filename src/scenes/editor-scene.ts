import DataKey from '../consts/data-key'
import {
  EditorItem,
  EditorItemButtons,
  EditorMode,
  EditorModeButtons,
  EditorPlaceItemProps,
  EditorPlaceItemsProps,
  EditorRectInfo,
  EditorRemoveItemProps,
} from '../consts/editor'
import EventKey from '../consts/event-key'
import { TILE_SIZE } from '../consts/globals'
import SceneKey from '../consts/scene-key'
import { IconsKey } from '../consts/texture-key'
import IconButton from '../objects/ui/icon-button'
import { convertPointerToPos } from '../utils/editor'
import { transitionEventsEmitter } from '../utils/transition'

export default class EditorScene extends Phaser.Scene {
  private dragStartPoint: Phaser.Math.Vector2 | null = null
  private cameraStartPoint: Phaser.Math.Vector2 | null = null
  private gameCamera!: Phaser.Cameras.Scene2D.Camera
  private isEditing!: boolean
  private isDrawing!: boolean
  private btnToggle!: IconButton
  private mode!: EditorMode
  private item!: EditorItem
  private editButtonsPanel!: Phaser.GameObjects.Container
  private editButtons!: EditorModeButtons
  private itemButtons!: EditorItemButtons
  private rectGraphics!: Phaser.GameObjects.Graphics
  private rectInfo: EditorRectInfo | null = null
  private spikeDir!: number
  private isCustomLevelRun!: boolean

  constructor() {
    super({ key: SceneKey.Editor })
  }

  create() {
    const { width } = this.scale
    this.isCustomLevelRun = this.registry.get(DataKey.IsCustomLevelRun)
    this.isEditing = true
    this.isDrawing = false
    this.scene.pause(SceneKey.Game)
    this.gameCamera = this.scene.get(SceneKey.Game).cameras.main
    this.gameCamera.stopFollow()
    this.rectGraphics = this.add.graphics()
    this.spikeDir = 0

    this.input.on('pointerdown', this.handlePointerDown, this)
    this.input.on('pointermove', this.handlePointerMove, this)
    this.input.on('pointerup', this.handlePointerUp, this)

    new IconButton(
      this,
      this.isCustomLevelRun ? 1740 : 1640,
      80,
      this.isCustomLevelRun ? IconsKey.Restart : IconsKey.Play,
      this.playRun
    )
    this.btnToggle = new IconButton(this, 1740, 80, IconsKey.Test, this.toggleEdition)
    new IconButton(this, 1840, 80, IconsKey.Close, this.quit)
    const btnMove = new IconButton(this, width / 2 - 150, 80, IconsKey.Move, () => {
      this.selectMode(EditorMode.Move)
    })
    btnMove.isSelected = true
    const btnEraser = new IconButton(this, width / 2 - 50, 80, IconsKey.Eraser, () => {
      this.selectMode(EditorMode.Eraser)
    })
    const btnDraw = new IconButton(this, width / 2 + 50, 80, IconsKey.Edit, () => {
      this.selectMode(EditorMode.Draw)
    })
    const btnRect = new IconButton(this, width / 2 + 150, 80, IconsKey.Rect, () => {
      this.selectMode(EditorMode.Rect)
    })

    this.editButtons = {
      [EditorMode.Move]: btnMove,
      [EditorMode.Eraser]: btnEraser,
      [EditorMode.Draw]: btnDraw,
      [EditorMode.Rect]: btnRect,
    } as EditorModeButtons
    this.selectMode(EditorMode.Move)

    const btnBobby = new IconButton(this, 80, 80, IconsKey.Bobby, () => {
      this.selectItem(EditorItem.Bobby)
    })
    const btnTarget = new IconButton(this, 80, 180, IconsKey.Target, () => {
      this.selectItem(EditorItem.Target)
    })
    const btnPlatform = new IconButton(this, 80, 280, IconsKey.Platform, () => {
      this.selectItem(EditorItem.Platform)
    })
    btnPlatform.isSelected = true
    const btnFallingBlock = new IconButton(this, 80, 380, IconsKey.FallingBlock, () => {
      this.selectItem(EditorItem.FallingBlock)
    })
    const btnSpike = new IconButton(this, 80, 480, IconsKey.Spike, () => {
      if (this.item === EditorItem.Spike) {
        this.spikeDir = (this.spikeDir + 1) % 4
        btnSpike.rotateIcon()
      } else {
        this.selectItem(EditorItem.Spike)
      }
    })

    this.itemButtons = {
      [EditorItem.Bobby]: {
        btn: btnBobby,
        isMulti: false,
      },
      [EditorItem.Target]: {
        btn: btnTarget,
        isMulti: false,
      },
      [EditorItem.Platform]: {
        btn: btnPlatform,
        isMulti: true,
      },
      [EditorItem.FallingBlock]: {
        btn: btnFallingBlock,
        isMulti: true,
      },
      [EditorItem.Spike]: {
        btn: btnSpike,
        isMulti: true,
      },
    } as EditorItemButtons
    this.selectItem(EditorItem.Platform)

    const btnExport = new IconButton(this, 1840, 180, IconsKey.Export, () => {
      this.events.emit(EventKey.EditorExport)
    })
    const btnImport = new IconButton(this, 1840, 280, IconsKey.Import, this.importLevel)

    this.editButtonsPanel = this.add.container(0, 0, [
      btnMove,
      btnEraser,
      btnDraw,
      btnRect,
      btnPlatform,
      btnBobby,
      btnTarget,
      btnSpike,
      btnFallingBlock,
      btnExport,
      btnImport,
    ])

    if (this.isCustomLevelRun) {
      this.toggleEdition()
      this.btnToggle.disableInteractive().setVisible(false)
    }
  }

  async importLevel() {
    try {
      const data = await navigator.clipboard.readText()
      const decodedData = atob(data)
      const rawData = JSON.parse(decodedData)

      this.events.emit(EventKey.EditorImport, rawData)
    } catch {
      console.log('Niveau non valide')
    }
  }

  selectItem(to: EditorItem) {
    this.item = to
    for (const key in this.itemButtons) {
      const item = key as EditorItem
      this.itemButtons[item].btn.isSelected = item === to
    }
  }

  selectMode(to: EditorMode) {
    this.mode = to
    for (const key in this.editButtons) {
      const mode = key as EditorMode
      this.editButtons[mode].isSelected = mode === to
    }
  }

  toggleEdition() {
    this.isEditing = !this.isEditing
    this.events.emit(EventKey.EditorToggle, this.isEditing)
    this.btnToggle.toggleIcon(IconsKey.Edit)
    this.editButtonsPanel.setVisible(this.isEditing)
    if (this.isEditing) {
      this.scene.pause(SceneKey.Game)
    } else {
      this.events.emit(EventKey.EditorPlaytest)
    }
  }

  handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (!this.isEditing) return

    if (this.mode === EditorMode.Draw) {
      this.isDrawing = true
      this.emitPlaceItem(pointer)
    } else if (this.mode === EditorMode.Eraser) {
      this.isDrawing = true
      this.emitRemoveItem(pointer)
    } else if (this.mode === EditorMode.Move || this.mode === EditorMode.Rect) {
      this.dragStartPoint = new Phaser.Math.Vector2(pointer.x, pointer.y)
      this.cameraStartPoint = new Phaser.Math.Vector2(this.gameCamera.scrollX, this.gameCamera.scrollY)
    }
  }

  handlePointerMove(pointer: Phaser.Input.Pointer) {
    if (!this.isEditing || (this.mode === EditorMode.Rect && !this.itemButtons[this.item].isMulti)) return

    if (this.mode === EditorMode.Move && this.dragStartPoint && this.cameraStartPoint) {
      const dx = this.dragStartPoint.x - pointer.x
      const dy = this.dragStartPoint.y - pointer.y
      this.gameCamera.scrollX = this.cameraStartPoint.x + dx
      this.gameCamera.scrollY = this.cameraStartPoint.y + dy
    } else if (this.mode === EditorMode.Rect && this.dragStartPoint) {
      this.drawRect(pointer)
    } else if (this.mode === EditorMode.Draw && this.isDrawing) {
      this.emitPlaceItem(pointer)
    } else if (this.mode === EditorMode.Eraser && this.isDrawing) {
      this.emitRemoveItem(pointer)
    }
  }

  handlePointerUp() {
    if (this.mode === EditorMode.Rect && this.dragStartPoint && this.rectInfo) {
      this.events.emit(EventKey.EditorPlaceItems, {
        ...this.rectInfo,
        item: this.item,
        ...(this.item === EditorItem.Spike && { dir: this.spikeDir }),
      } as EditorPlaceItemsProps)
    }

    this.isDrawing = false
    this.dragStartPoint = null
    this.rectInfo = null
    this.cameraStartPoint = null
    this.rectGraphics.clear()
  }

  getWorldXY(pointer: Phaser.Input.Pointer) {
    return {
      worldX: pointer.worldX + this.gameCamera.scrollX,
      worldY: pointer.worldY + this.gameCamera.scrollY,
    }
  }

  drawRect(pointer: Phaser.Input.Pointer) {
    if (!this.dragStartPoint) return
    this.rectGraphics.clear()
    const { worldX, worldY } = this.getWorldXY(pointer)
    const startPosX = convertPointerToPos(this.dragStartPoint.x + this.gameCamera.scrollX)
    const startPosY = convertPointerToPos(this.dragStartPoint.y + this.gameCamera.scrollY)
    const pointerPosX = convertPointerToPos(worldX)
    const pointerPosY = convertPointerToPos(worldY)
    const width = pointerPosX - startPosX + Math.sign(pointer.worldX - this.dragStartPoint.x) * TILE_SIZE || TILE_SIZE
    const height = pointerPosY - startPosY + Math.sign(pointer.worldY - this.dragStartPoint.y) * TILE_SIZE || TILE_SIZE

    this.rectInfo = {
      worldX: this.dragStartPoint.x + this.gameCamera.scrollX,
      worldY: this.dragStartPoint.y + this.gameCamera.scrollY,
      cols: width / TILE_SIZE,
      rows: height / TILE_SIZE,
    }

    this.rectGraphics.fillStyle(0xc2c3c7, 0.5)
    this.rectGraphics.fillRect(
      startPosX - this.gameCamera.scrollX + (width < 0 ? TILE_SIZE : 0),
      startPosY - this.gameCamera.scrollY + (height < 0 ? TILE_SIZE : 0),
      width,
      height
    )
  }

  emitPlaceItem(pointer: Phaser.Input.Pointer) {
    const { worldX, worldY } = this.getWorldXY(pointer)
    this.events.emit(EventKey.EditorPlaceItem, {
      worldX,
      worldY,
      item: this.item,
      ...(this.item === EditorItem.Spike && { dir: this.spikeDir }),
    } as EditorPlaceItemProps)
  }

  emitRemoveItem(pointer: Phaser.Input.Pointer) {
    const { worldX, worldY } = this.getWorldXY(pointer)
    this.events.emit(EventKey.EditorRemoveItem, {
      worldX,
      worldY,
    } as EditorRemoveItemProps)
  }

  quit() {
    transitionEventsEmitter.emit(EventKey.TransitionStart)
    transitionEventsEmitter.once(
      EventKey.TransitionEnd,
      () => {
        const gameScene = this.scene.get(SceneKey.Game)
        if (this.isCustomLevelRun) {
          gameScene.scene.restart({ isCustomLevelRun: false })
        } else {
          gameScene.scene.start(SceneKey.Levels)
        }
      },
      this
    )
  }

  playRun() {
    transitionEventsEmitter.emit(EventKey.TransitionStart)
    transitionEventsEmitter.once(
      EventKey.TransitionEnd,
      () => {
        this.scene.get(SceneKey.Game).scene.restart({ isCustomLevelRun: true })
      },
      this
    )
  }
}
