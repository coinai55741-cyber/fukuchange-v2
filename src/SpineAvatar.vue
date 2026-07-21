<script setup lang="ts">
import { Application, Assets } from 'pixi.js'
import { Physics, Spine } from '@esotericsoftware/spine-pixi-v8'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Slot } from './gameData'

const props = defineProps<{
  outfit: Partial<Record<Slot, string>>
}>()

const host = ref<HTMLDivElement | null>(null)

const spineAssets = {
  skeleton: 'girl-skeleton',
  atlas: 'girl-atlas',
}

const attachmentByItem: Record<string, string[]> = {
  'body-blue': ['hakka_shirt_B'],
  'body-yellow': ['shirt'],
  'body-white': ['shirt'],
  'body-black': ['shirt'],
  'body-flower': ['shirt'],
  'pants-black': ['long_pants_B'],
  'pants-blue': ['long_pants_B'],
  'pants-yellow': ['shorts_B'],
  'pants-flower': ['shorts_B'],
  // 目前匯出的 skirt_B_under / skirt_B_over 使用同一張裙子圖，先只顯示前層版本，避免重複變深。
  'pants-white': ['skirt_B_over'],
  'shoes-white': ['sneakers_B'],
  'shoes-black': ['sneakers_B'],
  'shoes-rain': ['rain_boots_B'],
  'head-yellow': ['hat'],
  'head-black': ['hat'],
  'neck-white': ['scarf_B'],
  'knee-yellow': ['knee_protector_B'],
}

const selectableAttachments = [
  'head_normal', 'head_swim_cap', 'shirt', 'shorts_B', 'long_pants_B', 'skirt_B_under', 'skirt_B_over',
  'hat', 'head-swin', 'hakka_shirt_B', 'puffer_jacket_B', 'sweater_B', 'swimsuit_B', 'scarf_B',
  'sneakers_B', 'rain_boots_B', 'knee_protector_B',
]

let app: Application | null = null
let spine: Spine | null = null

function applyOutfit() {
  if (!spine) return

  spine.skeleton.setSlotsToSetupPose()
  for (const slotName of selectableAttachments) {
    spine.skeleton.findSlot(slotName)?.setAttachment(null)
  }

  spine.skeleton.setAttachment('body_base', 'body_base')
  spine.skeleton.setAttachment('head_normal', 'head_normal')

  for (const itemId of Object.values(props.outfit)) {
    if (!itemId) continue
    for (const attachment of attachmentByItem[itemId] ?? []) spine.skeleton.setAttachment(attachment, attachment)
  }

  spine.skeleton.updateWorldTransform(Physics.none)
}

onMounted(async () => {
  if (!host.value) return

  Assets.add({ alias: spineAssets.skeleton, src: '/spine/正面_角色架構.json' })
  Assets.add({ alias: spineAssets.atlas, src: '/spine/正面_角色架構.atlas' })
  await Assets.load([spineAssets.skeleton, spineAssets.atlas])

  app = new Application()
  await app.init({ width: 360, height: 570, backgroundAlpha: 0, antialias: true, preference: 'webgl' })
  host.value.appendChild(app.canvas)

  spine = Spine.from({ skeleton: spineAssets.skeleton, atlas: spineAssets.atlas })
  spine.scale.set(0.29)
  spine.x = 180
  spine.y = 546
  app.stage.addChild(spine)
  applyOutfit()
})

watch(() => props.outfit, applyOutfit, { deep: true })

onBeforeUnmount(() => {
  spine?.destroy({ children: true, texture: false, textureSource: false })
  app?.destroy(true, { children: true, texture: false, textureSource: false })
  spine = null
  app = null
})
</script>

<template>
  <div ref="host" class="spine-avatar" aria-label="阿梅角色換裝預覽"></div>
</template>

<style scoped>
.spine-avatar { width: 360px; height: 570px; display: grid; place-items: center; }
.spine-avatar :deep(canvas) { display: block; width: 360px; height: 570px; }
</style>
