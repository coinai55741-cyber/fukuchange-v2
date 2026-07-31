<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import lottie, { type AnimationItem } from 'lottie-web'

const props = defineProps<{
  src: string
  size?: number
}>()

const containerRef = ref<HTMLDivElement | null>(null)
let anim: AnimationItem | null = null

function loadAnimation() {
  if (anim) {
    anim.destroy()
    anim = null
  }
  if (!containerRef.value || !props.src) return

  anim = lottie.loadAnimation({
    container: containerRef.value,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: props.src
  })
}

onMounted(() => {
  loadAnimation()
})

watch(() => props.src, () => {
  loadAnimation()
})

onBeforeUnmount(() => {
  if (anim) {
    anim.destroy()
    anim = null
  }
})
</script>

<template>
  <div
    ref="containerRef"
    class="lottie-emoji-wrapper"
    :style="{ width: `${size || 64}px`, height: `${size || 64}px` }"
  ></div>
</template>

<style scoped>
.lottie-emoji-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.25rem;
  overflow: hidden;
  pointer-events: none;
}
.lottie-emoji-wrapper :deep(svg) {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
</style>
