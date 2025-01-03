<script setup lang="ts">
import { ref } from 'vue'
import Game from './game/Game.vue'
import Editor from './editor/Editor.vue'
import EventKey from './game/consts/event-key'
import { EventBus } from './game/utils/event-bus'

const isEditing = ref(false)

EventBus.on(EventKey.EditorToggle, () => {
  isEditing.value = !isEditing.value
})
</script>

<template>
  <Editor v-show="isEditing" @playtest="isEditing = false" />
  <Game v-show="!isEditing" />
</template>
