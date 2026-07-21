<script setup lang="ts">
import { Application, Assets } from 'pixi.js'
import { Physics, Spine } from '@esotericsoftware/spine-pixi-v8'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { clothing, type Clothing, type Slot } from './gameData'

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
  'body-puffer-white': ['puffer_jacket_B'],
  'body-puffer-black': ['puffer_jacket_B'],
  'body-sweater-white': ['sweater_B'],
  'body-swimsuit-yellow': ['swimsuit_B'],
  'pants-black': ['long_pants_B'],
  'pants-long-white': ['long_pants_B'],
  'pants-long-yellow': ['long_pants_B'],
  'pants-blue': ['long_pants_B'],
  'pants-yellow': ['shorts_B'],
  'pants-shorts-white': ['shorts_B'],
  'pants-shorts-black': ['shorts_B'],
  'pants-flower': ['shorts_B'],
  // 目前匯出的 skirt_B_under / skirt_B_over 使用同一張裙子圖，先只顯示前層版本，避免重複變深。
  'pants-white': ['skirt_B_over'],
  'shoes-white': ['sneakers_B'],
  'shoes-black': ['sneakers_B'],
  'shoes-rain': ['rain_boots_B'],
  'head-yellow': ['hat'],
  'head-black': ['hat'],
  'head-white': ['hat'],
  // 泳帽是「替換頭部」加上「泳帽本體」的組合，兩個 Spine attachment 必須同時開啟。
  'head-swim-cap': ['head_swim_cap', 'head-swin'],
  'head-swim-cap-yellow': ['head_swim_cap', 'head-swin'],
  'neck-white': ['scarf_B'],
  'knee-yellow': ['knee_protector_B'],
}

// 只有「可染」衣物會變更 Spine slot tint。藍衫等固定原色的衣物不在此處處理。
const clothingById = new Map(clothing.map((item) => [item.id, item]))
const tintByColor: Partial<Record<Clothing['colorKey'], readonly [number, number, number]>> = {
  blue: [0.35, 0.61, 0.87],
  yellow: [1, 0.76, 0.12],
  white: [1, 1, 1],
  black: [0.16, 0.17, 0.2],
  orange: [0.96, 0.45, 0.12],
  purple: [0.33, 0.14, 0.5],
}

// 泳帽使用另一張頭部／頭髮圖來替換外觀；此圖不屬於可染布料。
const tintAttachmentsByItem: Record<string, string[]> = {
  'head-swim-cap': ['head-swin'],
  'head-swim-cap-yellow': ['head-swin'],
}

const selectableAttachments = [
  'head_normal', 'head_swim_cap', 'shirt', 'shorts_B', 'long_pants_B', 'skirt_B_under', 'skirt_B_over',
  'hat', 'head-swin', 'hakka_shirt_B', 'puffer_jacket_B', 'sweater_B', 'swimsuit_B', 'scarf_B',
  'sneakers_B', 'rain_boots_B', 'knee_protector_B',
  // 客家花布服裝插槽 (Skins / 獨立插槽)
  'shirt_hakka', 'shorts_B_hakka', 'long_pants_B_hakka', 'skirt_B_under_hakka', 'skirt_B_over_hakka',
  'hat_hakka', 'head-swin_hakka', 'puffer_jacket_B_hakka', 'sweater_B_hakka', 'swimsuit_B_hakka',
  'scarf_B_hakka', 'knee_protector_B_hakka', 'sneakers_B_hakka', 'rain_boots_B_hakka',
]

let app: Application | null = null
let spine: Spine | null = null

function tintItem(itemId: string) {
  const item = clothingById.get(itemId)
  if (!spine || !item || item.colorMode !== 'dye') return

  // 花布不是單一顏色，必須等美術提供 pattern attachment / mask 後再套疊。
  const tint = tintByColor[item.colorKey]
  if (!tint) return

  const tintAttachments = itemId.startsWith('swim-cap-') ? ['head-swin'] : tintAttachmentsByItem[itemId] ?? attachmentsForItem(itemId)
  for (const slotName of tintAttachments) {
    spine.skeleton.findSlot(slotName)?.color.set(tint[0], tint[1], tint[2], 1)
  }
}

function isFlowerItem(itemId: string) {
  return itemId.endsWith('-red_flower_pattern') || itemId === 'body-flower' || itemId === 'pants-flower'
}

function attachmentsForItem(itemId: string) {
  const isHakka = isFlowerItem(itemId)
  const suffix = isHakka ? '_hakka' : ''

  if (attachmentByItem[itemId]) {
    if (itemId === 'body-flower') return ['shirt_hakka']
    if (itemId === 'pants-flower') return ['shorts_B_hakka']
    return attachmentByItem[itemId]
  }

  if (itemId.startsWith('short-shirt-')) return [isHakka ? 'shirt_hakka' : 'shirt']
  if (itemId.startsWith('puffer-jacket-')) return [`puffer_jacket_B${suffix}`]
  if (itemId.startsWith('sweater-')) return [`sweater_B${suffix}`]
  if (itemId.startsWith('swimsuit-')) return [`swimsuit_B${suffix}`]
  if (itemId.startsWith('long-pants-')) return [`long_pants_B${suffix}`]
  if (itemId.startsWith('shorts-')) return [`shorts_B${suffix}`]
  if (itemId.startsWith('skirt-')) return [`skirt_B_over${suffix}`]
  if (itemId.startsWith('sneakers-')) return [`sneakers_B${suffix}`]
  if (itemId.startsWith('rain-boots-')) return [`rain_boots_B${suffix}`]
  if (itemId.startsWith('hat-')) return [`hat${suffix}`]
  if (itemId.startsWith('scarf-')) return [`scarf_B${suffix}`]
  if (itemId.startsWith('knee-protector-')) return [`knee_protector_B${suffix}`]
  if (itemId.startsWith('swim-cap-')) return [`head_swim_cap${suffix}`, `head-swin${suffix}`]
  return []
}

function adjustDrawOrder() {
  if (!spine) return
  const drawOrder = spine.skeleton.drawOrder

  // Desired relative draw order:
  // knee_protector -> sneakers/rain_boots -> skirt_B_over -> hakka_shirt_B (藍衫) -> puffer_jacket_B (羽絨衣)
  const slotsToMove = [
    'knee_protector_B', 'knee_protector_B_hakka',
    'sneakers_B', 'sneakers_B_hakka',
    'rain_boots_B', 'rain_boots_B_hakka',
    'skirt_B_over', 'skirt_B_over_hakka',
    'hakka_shirt_B',
    'puffer_jacket_B', 'puffer_jacket_B_hakka'
  ]

  const extracted = drawOrder.filter(s => slotsToMove.includes(s.data.name))
  extracted.sort((a, b) => {
    return slotsToMove.indexOf(a.data.name) - slotsToMove.indexOf(b.data.name)
  })

  const firstIdx = drawOrder.findIndex(s => slotsToMove.includes(s.data.name))
  if (firstIdx !== -1) {
    const filtered = drawOrder.filter(s => !slotsToMove.includes(s.data.name))
    filtered.splice(firstIdx, 0, ...extracted)
    spine.skeleton.drawOrder = filtered
  }
}

function applyOutfit() {
  if (!spine) return

  spine.skeleton.setSlotsToSetupPose()
  for (const slotName of selectableAttachments) {
    spine.skeleton.findSlot(slotName)?.setAttachment(null)
  }

  const itemIds = Object.values(props.outfit).filter((itemId): itemId is string => Boolean(itemId))
  const usesSwimCap = itemIds.some((itemId) => itemId === 'head-swim-cap' || itemId === 'head-swim-cap-yellow' || itemId.startsWith('swim-cap-'))

  spine.skeleton.setAttachment('body_base', 'body_base')
  if (!usesSwimCap) spine.skeleton.setAttachment('head_normal', 'head_normal')

  for (const itemId of itemIds) {
    for (const attachment of attachmentsForItem(itemId)) spine.skeleton.setAttachment(attachment, attachment)
    tintItem(itemId)
  }

  adjustDrawOrder()

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
.spine-avatar { position: relative; width: 360px; height: 570px; min-width: 360px; min-height: 570px; display: grid; place-items: center; }
.spine-avatar :deep(canvas) { display: block; width: 360px; height: 570px; }

</style>
