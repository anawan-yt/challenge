import DataKey from '../consts/data-key'
import {
  EditorType,
  EditorTypeButtons,
  EditorMode,
  EditorModeButtons,
  EditorRectInfo,
  EditorItem,
  EditorToolButtons,
  EditorTool,
  EDITOR_TYPE_TOOLS,
} from '../consts/editor'
import EventKey from '../consts/event-key'
import { TILE_SIZE } from '../consts/globals'
import SceneKey from '../consts/scene-key'
import { IconsKey } from '../consts/texture-key'
import IconButton from '../objects/ui/icon-button'
import { convertPointerToPos } from '../utils/editor'
import { transitionEventsEmitter } from '../utils/transition'
import GameScene from './game-scene'

export default class EditorScene extends Phaser.Scene {
  private dragStartPoint: Phaser.Math.Vector2 | null = null
  private cameraStartPoint: Phaser.Math.Vector2 | null = null
  private gameScene!: GameScene
  private gameCamera!: Phaser.Cameras.Scene2D.Camera
  private isEditing!: boolean
  private isDrawing!: boolean
  private btnToggle!: IconButton
  private mode!: EditorMode
  private item!: EditorType
  private editButtonsPanel!: Phaser.GameObjects.Container
  private editButtons!: EditorModeButtons
  private toolButtonsPanel!: Phaser.GameObjects.Container
  private toolButtons!: EditorToolButtons
  private itemButtons!: EditorTypeButtons
  private rectGraphics!: Phaser.GameObjects.Graphics
  private rectInfo: EditorRectInfo | null = null
  private spikeDir!: number
  private cannonDir!: number
  private isCustomLevelRun!: boolean
  private spaceKey: Phaser.Input.Keyboard.Key | undefined
  // private currentItem: EditorItem | null = null

  constructor() {
    super({ key: SceneKey.Editor })
  }

  create() {
    const { width, height } = this.scale
    this.isCustomLevelRun = this.registry.get(DataKey.IsCustomLevelRun)
    this.isEditing = true
    this.isDrawing = false
    this.scene.pause(SceneKey.Game)
    this.gameScene = this.scene.get(SceneKey.Game) as GameScene
    this.gameCamera = this.gameScene.cameras.main
    this.gameCamera.stopFollow()
    this.rectGraphics = this.add.graphics()
    this.spikeDir = 0
    this.cannonDir = 0

    this.input.on('pointerdown', this.handlePointerDown, this)
    this.input.on('pointermove', this.handlePointerMove, this)
    this.input.on('pointerup', this.handlePointerUp, this)
    this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    new IconButton(
      this,
      this.isCustomLevelRun ? 1740 : 1640,
      80,
      this.isCustomLevelRun ? IconsKey.Restart : IconsKey.Play,
      this.playRun
    )
    this.btnToggle = new IconButton(this, 1740, 80, IconsKey.Test, this.toggleEdition)
    new IconButton(this, 1840, 80, IconsKey.Close, this.quit)
    const btnSelect = new IconButton(this, width / 2 - 200, 80, IconsKey.Select, () => {
      this.selectMode(EditorMode.Select)
    })
    const btnMove = new IconButton(this, width / 2 - 100, 80, IconsKey.Move, () => {
      this.selectMode(EditorMode.Move)
    })
    btnMove.isSelected = true
    const btnEraser = new IconButton(this, width / 2, 80, IconsKey.Eraser, () => {
      this.selectMode(EditorMode.Eraser)
    })
    const btnDraw = new IconButton(this, width / 2 + 100, 80, IconsKey.Edit, () => {
      this.selectMode(EditorMode.Draw)
    })
    const btnRect = new IconButton(this, width / 2 + 200, 80, IconsKey.Rect, () => {
      this.selectMode(EditorMode.Rect)
    })

    this.editButtons = {
      [EditorMode.Select]: btnSelect,
      [EditorMode.Move]: btnMove,
      [EditorMode.Eraser]: btnEraser,
      [EditorMode.Draw]: btnDraw,
      [EditorMode.Rect]: btnRect,
    } as EditorModeButtons
    this.selectMode(EditorMode.Move)

    const btnBobby = new IconButton(this, 80, 80, IconsKey.Bobby, () => {
      this.selectType(EditorType.Bobby)
    })
    const btnTarget = new IconButton(this, 80, 180, IconsKey.Target, () => {
      this.selectType(EditorType.Target)
    })
    const btnPlatform = new IconButton(this, 80, 280, IconsKey.Platform, () => {
      this.selectType(EditorType.Platform)
    })
    btnPlatform.isSelected = true
    const btnFallingBlock = new IconButton(this, 80, 380, IconsKey.FallingBlock, () => {
      this.selectType(EditorType.FallingBlock)
    })
    const btnSpike = new IconButton(this, 80, 480, IconsKey.Spike, () => {
      if (this.item === EditorType.Spike) {
        this.spikeDir = (this.spikeDir + 1) % 4
        btnSpike.rotateIcon()
      } else {
        this.selectType(EditorType.Spike)
      }
    })
    const btnSpikyBall = new IconButton(this, 80, 580, IconsKey.SpikyBall, () => {
      this.selectType(EditorType.SpikyBall)
    })
    const btnCannon = new IconButton(this, 80, 680, IconsKey.Cannon, () => {
      if (this.item === EditorType.Cannon) {
        this.cannonDir = (this.cannonDir + 1) % 4
        btnCannon.rotateIcon()
      } else {
        this.selectType(EditorType.Cannon)
      }
    })

    this.itemButtons = {
      [EditorType.Bobby]: {
        btn: btnBobby,
        isMulti: false,
      },
      [EditorType.Target]: {
        btn: btnTarget,
        isMulti: false,
      },
      [EditorType.Platform]: {
        btn: btnPlatform,
        isMulti: true,
      },
      [EditorType.FallingBlock]: {
        btn: btnFallingBlock,
        isMulti: true,
      },
      [EditorType.Spike]: {
        btn: btnSpike,
        isMulti: true,
      },
      [EditorType.SpikyBall]: {
        btn: btnSpikyBall,
        isMulti: true,
      },
      [EditorType.Cannon]: {
        btn: btnCannon,
        isMulti: true,
      },
    } as EditorTypeButtons

    const btnExport = new IconButton(this, 1840, 180, IconsKey.Export, () => {
      this.events.emit(EventKey.EditorExport)
    })
    const btnImport = new IconButton(this, 1840, 280, IconsKey.Import, this.importLevel)

    const btnDelete = new IconButton(this, width / 2, height - 80, IconsKey.Delete, () => {
      this.events.emit(EventKey.EditorDeleteCurrent)
    })

    const btnRotate = new IconButton(this, width / 2, height - 80, IconsKey.Restart, () => {
      this.events.emit(EventKey.EditorRotateCurrent)
    })

    this.toolButtons = {
      [EditorTool.Delete]: btnDelete,
      [EditorTool.Rotate]: btnRotate,
    } as EditorToolButtons

    this.toolButtonsPanel = this.add.container(0, 0, [btnDelete, btnRotate]).setVisible(false)

    this.editButtonsPanel = this.add.container(0, 0, [
      btnSelect,
      btnMove,
      btnEraser,
      btnDraw,
      btnRect,
      btnPlatform,
      btnBobby,
      btnTarget,
      btnSpike,
      btnFallingBlock,
      btnSpikyBall,
      btnCannon,
      btnExport,
      btnImport,
      this.toolButtonsPanel,
    ])

    if (this.isCustomLevelRun) {
      this.toggleEdition()
      this.btnToggle.disableInteractive().setVisible(false)
    }

    this.selectType(EditorType.Platform)
    this.selectMode(EditorMode.Move)

    this.gameScene.events.on(EventKey.EditorItemSelected, this.handleItemSelected, this)
    this.events.once('shutdown', this.handleShutdown, this)
  }

  handleShutdown() {
    this.events.off(EventKey.EditorItemSelected, this.handleItemSelected, this)
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

  handleItemSelected(item: EditorItem | null) {
    // this.currentItem = item
    if (!item) {
      this.toolButtonsPanel.setVisible(false)
    } else {
      const tools = [EditorTool.Delete, ...(EDITOR_TYPE_TOOLS[item.type] ? EDITOR_TYPE_TOOLS[item.type]! : [])]
      Object.values(this.toolButtons).forEach((btn) => {
        btn.setVisible(false)
      })

      const toolsToShow = Object.keys(this.toolButtons).filter((key) => tools.includes(key as EditorTool))
      const startPosX = this.scale.width / 2 - (toolsToShow.length % 2 === 0 ? 50 : 0)
      toolsToShow.forEach((key, index) => {
        this.toolButtons[key as EditorTool]
          .setVisible(true)
          .setPosition(startPosX + index * 100, this.scale.height - 80)
      })
      this.toolButtonsPanel.setVisible(true)
    }
  }

  selectType(to: EditorType) {
    this.item = to
    for (const key in this.itemButtons) {
      const item = key as EditorType
      this.itemButtons[item].btn.isSelected = item === to
    }
    this.selectMode(EditorMode.Draw)
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

    if (this.mode === EditorMode.Move || this.spaceKey?.isDown || this.mode === EditorMode.Rect) {
      this.dragStartPoint = new Phaser.Math.Vector2(pointer.x, pointer.y)
      this.cameraStartPoint = new Phaser.Math.Vector2(this.gameCamera.scrollX, this.gameCamera.scrollY)
    } else if (this.mode === EditorMode.Select) {
      this.selectItem(pointer)
    } else if (this.mode === EditorMode.Draw) {
      this.isDrawing = true
      this.emitPlaceItem(pointer)
    } else if (this.mode === EditorMode.Eraser) {
      this.isDrawing = true
      this.emitRemoveItem(pointer)
    }
  }

  handlePointerMove(pointer: Phaser.Input.Pointer) {
    if (!this.isEditing || (this.mode === EditorMode.Rect && !this.itemButtons[this.item].isMulti)) return

    if ((this.mode === EditorMode.Move || this.spaceKey?.isDown) && this.dragStartPoint && this.cameraStartPoint) {
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
        ...(this.item === EditorType.Spike && { dir: this.spikeDir }),
      })
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

  selectItem(pointer: Phaser.Input.Pointer) {
    const { worldX, worldY } = this.getWorldXY(pointer)
    this.events.emit(EventKey.EditorSelectItem, {
      worldX,
      worldY,
    })
  }

  emitPlaceItem(pointer: Phaser.Input.Pointer) {
    const { worldX, worldY } = this.getWorldXY(pointer)
    this.events.emit(EventKey.EditorPlaceItem, {
      worldX,
      worldY,
      item: this.item,
      ...(this.item === EditorType.Spike && { dir: this.spikeDir }),
      ...(this.item === EditorType.Cannon && { dir: this.cannonDir }),
    })
  }

  emitRemoveItem(pointer: Phaser.Input.Pointer) {
    const { worldX, worldY } = this.getWorldXY(pointer)
    this.events.emit(EventKey.EditorRemoveItem, {
      worldX,
      worldY,
    })
  }

  quit() {
    transitionEventsEmitter.emit(EventKey.TransitionStart)
    transitionEventsEmitter.once(
      EventKey.TransitionEnd,
      () => {
        const gameScene = this.gameScene
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
        this.gameScene.scene.restart({ isCustomLevelRun: true })
      },
      this
    )
  }
}
