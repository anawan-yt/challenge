import { TILE_SIZE } from '../consts/globals'
import { LevelFallingBlock, LevelOneWayPlatform, LevelPlatform, LevelSpike } from '../consts/level'

export function convertPointerToPos(pos: number) {
  return Math.floor(pos / TILE_SIZE) * TILE_SIZE
}

export function convertPlatformsToCells(platforms: LevelPlatform[]) {
  const cells: LevelPlatform[] = []

  platforms.forEach(({ x, y, width, height }) => {
    const cols = width / 80
    const rows = height / 80

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        cells.push({
          x: x + col * TILE_SIZE,
          y: y + row * TILE_SIZE,
          width: TILE_SIZE,
          height: TILE_SIZE,
        })
      }
    }
  })

  return cells
}

export function convertSpikesToCells(spikes: LevelSpike[]) {
  const cells: LevelSpike[] = []
  spikes.forEach((spike) => {
    const num = spike.num ?? 1
    for (let i = 0; i < num; i++) {
      const isHorizontal = spike.dir === 0 || spike.dir === 2
      cells.push({
        x: spike.x + (isHorizontal ? TILE_SIZE * i : 0),
        y: spike.y + (!isHorizontal ? TILE_SIZE * i : 0),
        dir: spike.dir,
      })
    }
  })

  return cells
}

export function convertFallingBlocksToCells(fallingBlocks: LevelFallingBlock[]) {
  const cells: LevelSpike[] = []
  fallingBlocks.forEach((fallingBlock) => {
    const num = fallingBlock.num ?? 1
    for (let i = 0; i < num; i++) {
      cells.push({
        x: fallingBlock.x + TILE_SIZE * i,
        y: fallingBlock.y,
      })
    }
  })

  return cells
}

export function getSpikesFromGrid(cells: LevelSpike[]) {
  if (cells.some(({ num }) => num && num !== 1)) {
    return cells
  }

  const remainingObjects = [...(cells || [])].sort((a, b) => {
    if (a.y === b.y) {
      return a.x - b.x
    }
    return a.y - b.y
  })
  const groupedObjects: LevelSpike[] = []

  while (remainingObjects.length > 0) {
    const base = remainingObjects.shift()!
    const group = { ...base, num: 1 }
    const toCheck = [base]

    while (toCheck.length > 0) {
      const current = toCheck.pop()!
      for (let i = remainingObjects.length - 1; i >= 0; i--) {
        const obj = remainingObjects[i]
        if (obj.dir !== current.dir) continue
        const dir = group.dir ?? 0
        let isAdjacent =
          dir === 0 || dir === 2
            ? Math.abs(current.x - obj.x) === TILE_SIZE && current.y === obj.y
            : Math.abs(current.y - obj.y) === TILE_SIZE && current.x === obj.x
        if (isAdjacent) {
          group.num++
          toCheck.push(obj)
          remainingObjects.splice(i, 1)
        }
      }
    }
    groupedObjects.push(group)
  }
  return groupedObjects
}

export function getFallingBlocksFromGrid(cells: LevelFallingBlock[]) {
  const fallingBlocks = [...(cells || [])].sort((a, b) => {
    if (a.y === b.y) {
      return a.x - b.x
    }
    return a.y - b.y
  })

  const groupedObjects = []
  let currentGroup = null

  for (let i = 0; i < fallingBlocks.length; i++) {
    const current = fallingBlocks[i]

    if (!currentGroup) {
      currentGroup = { ...current, num: 1 }
      continue
    }

    const isAdjacentHorizontal =
      Math.abs(current.x - (currentGroup.x + (currentGroup.num - 1) * TILE_SIZE)) === TILE_SIZE &&
      current.y === currentGroup.y

    if (isAdjacentHorizontal) {
      currentGroup.num++
    } else {
      groupedObjects.push(currentGroup)
      currentGroup = { ...current, num: 1 }
    }
  }

  if (currentGroup) {
    groupedObjects.push(currentGroup)
  }

  return groupedObjects
}

export function getPlatformsFromGrid(cells: LevelPlatform[]) {
  if (cells.some(({ width, height }) => width !== TILE_SIZE || height !== TILE_SIZE)) {
    return cells
  }

  const platforms = [...cells].sort((a, b) => a.x - b.x || a.y - b.y)
  const platformMap = new Map()
  platforms.forEach(({ x, y }) => {
    platformMap.set(`${x},${y}`, { x, y })
  })

  const groupedColumns: LevelPlatform[] = []
  platformMap.forEach((platform, key) => {
    if (!platformMap.has(key)) {
      return
    }

    const column = {
      x: platform.x,
      y: platform.y,
      width: TILE_SIZE,
      height: TILE_SIZE,
    }

    let currentY = platform.y + TILE_SIZE
    while (platformMap.has(`${platform.x},${currentY}`)) {
      column.height += TILE_SIZE
      platformMap.delete(`${platform.x},${currentY}`)
      currentY += TILE_SIZE
    }

    groupedColumns.push(column)
    platformMap.delete(key)
  })

  const groupedRectangles = []
  groupedColumns.sort((a, b) => a.y - b.y || a.x - b.x)

  while (groupedColumns.length > 0) {
    const base = groupedColumns.shift()!
    const rectangle = { ...base }

    let extended = true
    while (extended) {
      extended = false
      for (let i = groupedColumns.length - 1; i >= 0; i--) {
        const column = groupedColumns[i]
        if (
          column.y === rectangle.y &&
          column.height === rectangle.height &&
          column.x === rectangle.x + rectangle.width
        ) {
          rectangle.width += column.width
          groupedColumns.splice(i, 1)
          extended = true
        }
      }
    }

    groupedRectangles.push(rectangle)
  }

  return groupedRectangles
}

export function getOneWayPlatformsFromGrid(cells: LevelOneWayPlatform[]) {
  const platforms = [...cells].sort((a, b) => a.y - b.y || a.x - b.x)
  const platformMap = new Map()
  platforms.forEach(({ x, y }) => {
    platformMap.set(`${x},${y}`, { x, y })
  })

  const groupedRows: LevelOneWayPlatform[] = []
  platformMap.forEach((platform, key) => {
    if (!platformMap.has(key)) {
      return
    }

    const row = {
      x: platform.x,
      y: platform.y,
      width: TILE_SIZE,
    }

    let currentX = platform.x + TILE_SIZE
    while (platformMap.has(`${currentX},${platform.y}`)) {
      row.width += TILE_SIZE
      platformMap.delete(`${currentX},${platform.y}`)
      currentX += TILE_SIZE
    }

    groupedRows.push(row)
    platformMap.delete(key)
  })

  return groupedRows
}
