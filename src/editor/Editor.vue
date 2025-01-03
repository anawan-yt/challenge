<script setup lang="ts">
import { computed, ref } from 'vue'
import { DataLevel, LevelItem } from '../game/consts/level'
import { EventBus } from '../game/utils/event-bus'
import EventKey from '../game/consts/event-key'

enum EditorMode {
  Bobby = 'bobby',
  Platforms = 'platforms',
  Target = 'target',
  Eraser = 'eraser',
}

const sizeRatio = 2
const cellSize = 40
const rows = ref(60)
const cols = ref(60)
const grid = ref<HTMLDivElement | null>(null)
const modalExport = ref<HTMLDialogElement | null>(null)
const modalImport = ref<HTMLDialogElement | null>(null)
const importValue = ref<string>('')
const gridSize = computed(() => ({
  width: `${cols.value * cellSize + 1}px`,
  height: `${rows.value * cellSize + 1}px`,
}))
const mode = ref<EditorMode>(EditorMode.Platforms)
const isCurrentPlatformOverlapping = computed(() =>
  items.value.some((item) => checkItemsOverlap(item, currentPlatform.value))
)

const isDrawing = ref(false)
const startX = ref(0)
const startY = ref(0)
const currentPlatform = ref<LevelItem | null>(null)
const platforms = ref<LevelItem[]>([])
const bobby = ref<LevelItem | null>(null)
const target = ref<LevelItem | null>(null)

const items = computed(() => [
  ...platforms.value,
  ...(bobby.value ? [bobby.value] : []),
  ...(target.value ? [target.value] : []),
])

const emit = defineEmits<{
  (event: 'playtest'): void
}>()

const startDrawing = (e: MouseEvent) => {
  if (mode.value !== EditorMode.Platforms || !grid.value) {
    return
  }

  isDrawing.value = true
  const rect = grid.value.getBoundingClientRect()
  startX.value = Math.floor((e.clientX - rect.left) / cellSize) * cellSize
  startY.value = Math.floor((e.clientY - rect.top) / cellSize) * cellSize
  currentPlatform.value = { x: startX.value, y: startY.value, width: cellSize, height: cellSize }
}

const drawPlatform = (e: MouseEvent) => {
  if (!isDrawing.value || !grid.value) {
    return
  }

  const rect = grid.value.getBoundingClientRect()
  const endX = Math.floor((e.clientX - rect.left) / cellSize) * cellSize
  const endY = Math.floor((e.clientY - rect.top) / cellSize) * cellSize
  const width = Math.abs(endX - startX.value) + cellSize
  const height = Math.abs(endY - startY.value) + cellSize

  currentPlatform.value = { x: Math.min(startX.value, endX), y: Math.min(startY.value, endY), width, height }
}

const stopDrawing = () => {
  if (mode.value !== EditorMode.Platforms) return

  if (isDrawing.value && currentPlatform.value && !isCurrentPlatformOverlapping.value) {
    platforms.value.push({ ...currentPlatform.value })
  }
  currentPlatform.value = null
  isDrawing.value = false
}

const placeElement = (e: MouseEvent) => {
  if (mode.value === EditorMode.Platforms || !grid.value) return

  const rect = grid.value.getBoundingClientRect()
  const x = Math.floor((e.clientX - rect.left) / cellSize) * cellSize
  const y = Math.floor((e.clientY - rect.top) / cellSize) * cellSize
  const isOverlapping = items.value.some((item) => checkItemsOverlap(item, { x, y, width: cellSize, height: cellSize }))

  if (!isOverlapping) {
    const data = { x, y, width: cellSize, height: cellSize }

    switch (mode.value) {
      case EditorMode.Bobby:
        bobby.value = data
        break
      case EditorMode.Target:
        target.value = data
        break
    }
  }
}

const checkItemsOverlap = (obj1: LevelItem, obj2: LevelItem | null) => {
  if (!obj2) {
    return false
  }

  return !(
    obj1.x + obj1.width <= obj2.x ||
    obj1.x >= obj2.x + obj2.width ||
    obj1.y + obj1.height <= obj2.y ||
    obj1.y >= obj2.y + obj2.height
  )
}

const testLevel = () => {
  if (!bobby.value) return

  const levelData = levelToJson()
  EventBus.emit(EventKey.EditorPlaytest, levelData)
  emit('playtest')
}

const levelToJson = (): DataLevel => ({
  world: {
    width: cols.value * cellSize * sizeRatio,
    height: rows.value * cellSize * sizeRatio,
  },
  target: {
    x: ((target.value?.x ?? 0) + cellSize / 2) * sizeRatio,
    y: ((target.value?.y ?? 0) + cellSize / 2) * sizeRatio,
  },
  platforms: platforms.value.map((platform) => ({
    x: platform.x * sizeRatio,
    y: platform.y * sizeRatio,
    width: platform.width * sizeRatio,
    height: platform.height * sizeRatio,
  })),
  player: {
    x: (bobby.value!.x + cellSize / 2) * sizeRatio,
    y: (bobby.value!.y + cellSize / 2) * sizeRatio,
  },
})

const handlePlatformClick = (index: number) => {
  if (mode.value !== EditorMode.Eraser) return
  platforms.value.splice(index, 1)
}

const handleBobbyClick = () => {
  if (mode.value !== EditorMode.Eraser) return
  bobby.value = null
}

const handleTargetClick = () => {
  if (mode.value !== EditorMode.Eraser) return
  target.value = null
}

const exportLevel = async () => {
  if (!bobby.value) return
  const levelData = btoa(JSON.stringify(levelToJson()))
  await navigator.clipboard.writeText(levelData)
  modalExport.value?.showModal()
}

const showImportModal = () => {
  modalImport.value?.showModal()
}

const importLevel = () => {
  if (!importValue.value) return

  try {
    const decodedData = atob(importValue.value)
    const rawData = JSON.parse(decodedData)

    bobby.value = {
      x: (rawData.player?.x ?? 0) / sizeRatio - cellSize / 2,
      y: (rawData.player?.y ?? 0) / sizeRatio - cellSize / 2,
      width: cellSize,
      height: cellSize,
    }

    target.value = {
      x: (rawData.target?.x ?? 0) / sizeRatio - cellSize / 2,
      y: (rawData.target?.y ?? 0) / sizeRatio - cellSize / 2,
      width: cellSize,
      height: cellSize,
    }

    platforms.value = (rawData.platforms || []).reduce((acc: LevelItem[], item: any) => {
      if (
        typeof item.x === 'number' &&
        typeof item.y === 'number' &&
        typeof item.width === 'number' &&
        typeof item.height === 'number'
      ) {
        acc.push({
          x: item.x / sizeRatio,
          y: item.y / sizeRatio,
          width: item.width / sizeRatio,
          height: item.height / sizeRatio,
        })
      }
      return acc
    }, [])

    modalImport.value?.close()
  } catch {
    console.log('Niveau non valide')
  }
}
</script>

<template>
  <div
    class="editor absolute left-0 top-0 w-full h-full bg-slate-300 grid place-items-center overflow-auto"
    :class="{ 'is-eraser': mode === EditorMode.Eraser }"
  >
    <div
      ref="grid"
      class="editor__grid relative"
      :style="gridSize"
      @mousedown="startDrawing"
      @mousemove="drawPlatform"
      @mouseup="stopDrawing"
      @click="placeElement"
    >
      <div
        v-for="(platform, index) in platforms"
        :key="index"
        class="editor__platform absolute"
        :style="{
          top: `${platform.y}px`,
          left: `${platform.x}px`,
          width: `${platform.width}px`,
          height: `${platform.height}px`,
        }"
        @click="handlePlatformClick(index)"
      ></div>
      <div
        v-if="currentPlatform"
        class="editor__current absolute"
        :class="{ error: isCurrentPlatformOverlapping }"
        :style="{
          top: `${currentPlatform.y}px`,
          left: `${currentPlatform.x}px`,
          width: `${currentPlatform.width}px`,
          height: `${currentPlatform.height}px`,
        }"
      ></div>
      <div
        v-if="bobby"
        class="editor__bobby absolute bg-white"
        :style="{
          top: `${bobby.y}px`,
          left: `${bobby.x}px`,
        }"
        @click="handleBobbyClick"
      ></div>
      <div
        v-if="target"
        class="editor__target absolute rounded-full"
        :style="{
          top: `${target.y}px`,
          left: `${target.x}px`,
        }"
        @click="handleTargetClick"
      ></div>
    </div>
    <ul class="menu bg-base-200 rounded-box fixed right-4 top-4">
      <li>
        <button
          class="tooltip tooltip-left"
          :class="{ active: mode === EditorMode.Platforms }"
          data-tip="Plateforme"
          @click="mode = EditorMode.Platforms"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="size-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
            />
          </svg>
        </button>
      </li>
      <li>
        <button
          class="tooltip tooltip-left"
          :class="{ active: mode === EditorMode.Eraser }"
          data-tip="Effacer"
          @click="mode = EditorMode.Eraser"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="size-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </button>
      </li>
      <li>
        <button
          class="tooltip tooltip-left"
          :class="{ active: mode === EditorMode.Bobby }"
          data-tip="Bobby"
          @click="mode = EditorMode.Bobby"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="size-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </button>
      </li>
      <li>
        <button
          class="tooltip tooltip-left"
          :class="{ active: mode === EditorMode.Target }"
          data-tip="Portail"
          @click="mode = EditorMode.Target"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="size-5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
            />
          </svg>
        </button>
      </li>
      <li class="mt-1 pt-1 border-t border-gray-500">
        <button class="tooltip tooltip-left" data-tip="Exporter" @click="exportLevel">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="size-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
        </button>
      </li>
      <li>
        <button class="tooltip tooltip-left" data-tip="Importer" @click="showImportModal">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="size-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>
        </button>
      </li>
      <li class="mt-1 pt-1 border-t border-gray-500">
        <button class="tooltip tooltip-left" data-tip="Quitter" @click="EventBus.emit(EventKey.EditorToggle)">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="size-5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </li>
      <li>
        <button class="tooltip tooltip-left" data-tip="Tester" @click="testLevel">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="size-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
            />
          </svg>
        </button>
      </li>
    </ul>
    <dialog ref="modalExport" class="modal">
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="text-lg font-bold mb-2">Export</h3>
        <p>Le niveau a été collé dans le presse-papier</p>
      </div>
    </dialog>
    <dialog ref="modalImport" class="modal">
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="text-lg font-bold mb-2">Import</h3>
        <textarea
          v-model="importValue"
          class="textarea textarea-bordered w-full mb-2"
          placeholder="Coller le code du niveau et cliquer sur 'Importer'"
        ></textarea>
        <div class="text-right"><button class="btn" @click="importLevel">Importer</button></div>
      </div>
    </dialog>
  </div>
</template>

<style scoped lang="scss">
.editor {
  $c: &;
  &__grid {
    background-image: linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px);
    background-size: 40px 40px;
  }
  &__platform {
    background-color: #ab5236;
  }
  &__current {
    position: absolute;
    background-color: #ab5236;
    border: 2px dashed #000;
    opacity: 0.6;
    &.error {
      background-color: #ff004d;
    }
  }
  &__bobby,
  &__target {
    width: 40px;
    height: 40px;
  }
  &__target {
    background-color: #1d2b53;
  }
  &.is-eraser {
    #{$c}__platform,
    #{$c}__bobby,
    #{$c}__target {
      &:hover {
        opacity: 0.6;
      }
    }
  }
}
</style>
