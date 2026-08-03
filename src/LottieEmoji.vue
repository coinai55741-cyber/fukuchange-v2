<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import lottie, { type AnimationItem } from 'lottie-web'

const props = defineProps<{
  animationData?: any
  src?: string
  size?: number
}>()

const containerRef = ref<HTMLDivElement | null>(null)
let anim: AnimationItem | null = null
let loadedData: any = null
let loadedSrc: string | undefined = undefined

function loadAnimation() {
  if (anim && props.animationData === loadedData && props.src === loadedSrc) {
    return
  }

  if (anim) {
    anim.destroy()
    anim = null
  }
  if (!containerRef.value) return

  loadedData = props.animationData
  loadedSrc = props.src

  if (props.animationData) {
    anim = lottie.loadAnimation({
      container: containerRef.value,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: props.animationData
    })
  } else if (props.src) {
    anim = lottie.loadAnimation({
      container: containerRef.value,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: props.src
    })
  }
}

onMounted(() => {
  loadAnimation()
})

watch([() => props.animationData, () => props.src], () => {
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
  margin: 0 auto;
  overflow: hidden;
  pointer-events: none;
}
.lottie-emoji-wrapper :deep(svg) {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
</style>
