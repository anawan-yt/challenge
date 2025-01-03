<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import mountGame from './main.ts'

const game = ref()

onMounted(() => {
  game.value = mountGame('game')
})

onUnmounted(() => {
  if (game.value) {
    game.value.destroy(true)
    game.value = null
  }
})
</script>

<template>
  <div id="game"></div>
</template>
