import ga from 'gameanalytics'

export enum ProgressionEventType {
  Start = 'Start',
  Complete = 'Complete',
  Fail = 'Fail',
}

export function addProgressionEvent(type: string, world: number, level: number) {
  ga.GameAnalytics.addProgressionEvent(
    type,
    `world${world.toString().padStart(2, '0')}`,
    `level${level.toString().padStart(2, '0')}`
  )
}

export function addDesignEvent(name: string, value = 1) {
  ga.GameAnalytics.addDesignEvent(name, value)
  let storageValue = Number(localStorage.getItem(name)) || 0
  storageValue += value
  localStorage.setItem(name, storageValue.toString())
}
