import { DataLevel, PlayerDataLevel } from '../consts/level'
import { levelsData } from '../levels'

export function getLevelTotalCoins(level: number | DataLevel) {
  const data = typeof level === 'number' ? levelsData[`level${level}`] : level
  return (data?.coins || []).reduce((acc, { numX, numY }) => acc + Math.max(numX || 1, numY || 1), 0)
}

export function getUnlockedLevels(): PlayerDataLevel[] {
  const unlockedLevelsString = localStorage.getItem('unlockedLevels')
  if (unlockedLevelsString) {
    return JSON.parse(unlockedLevelsString)
  } else {
    const level = {
      level: 1,
      time: 0,
    }
    localStorage.setItem('unlockedLevels', JSON.stringify([level]))
    return [level]
  }
}

export function getLevelInfo(levelNum: number) {
  const unlockedLevels = getUnlockedLevels()
  return unlockedLevels.find(({ level }) => level === levelNum)
}

export function updateLevelInfo(levelNum: number, data: Partial<PlayerDataLevel>) {
  const unlockedLevels = getUnlockedLevels()
  const index = unlockedLevels.findIndex(({ level }) => level === levelNum)
  if (index === -1) return

  unlockedLevels[index] = { ...unlockedLevels[index], ...data }
  localStorage.setItem('unlockedLevels', JSON.stringify(unlockedLevels))
}

export function unlockLevel(levelNum: number, time = 0) {
  const unlockedLevels = getUnlockedLevels()
  if (unlockedLevels.some(({ level }) => level === levelNum)) return

  unlockedLevels.push({
    level: levelNum,
    time,
  })
  localStorage.setItem('unlockedLevels', JSON.stringify(unlockedLevels))
}

export function unlockAllLevels() {
  let unlockedLevels = getUnlockedLevels()
  const unlockedLevelSet = new Set(unlockedLevels.map((levelData) => levelData.level))
  for (let level = 1; level <= Object.keys(levelsData).length; level++) {
    if (!unlockedLevelSet.has(level)) {
      unlockedLevels.push({ level, time: 0 })
    }
  }

  localStorage.setItem('unlockedLevels', JSON.stringify(unlockedLevels))
}

export function resetBestTimes() {
  const unlockedLevels = getUnlockedLevels()
  const resetTimesLevels = unlockedLevels.map((level) => ({ ...level, time: 0 }))
  localStorage.setItem('unlockedLevels', JSON.stringify(resetTimesLevels))
}

export function ensureLevelData(data: Partial<DataLevel>): DataLevel {
  if (!data.world || !data.player || !data.target || !data.platforms) {
    throw new Error('Les champs obligatoires (world, player, target, platforms) sont manquants.')
  }

  return {
    isBoss: data.isBoss,
    bossTrigger: data.bossTrigger,
    world: data.world,
    player: data.player,
    target: data.target,
    checkpoint: data.checkpoint,
    hills: data.hills ?? [],
    hillsFront: data.hillsFront ?? [],
    clouds: data.clouds,
    platforms: data.platforms,
    oneWayPlatforms: data.oneWayPlatforms ?? [],
    transformers: data.transformers ?? [],
    fallingBlocks: data.fallingBlocks ?? [],
    coins: data.coins ?? [],
    enemies: data.enemies ?? [],
    spikyBalls: data.spikyBalls ?? [],
    spikes: data.spikes ?? [],
    cannons: data.cannons ?? [],
    eventBlocks: data.eventBlocks ?? [],
  }
}
