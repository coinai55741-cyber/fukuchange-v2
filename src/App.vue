<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { clothing, questions, tabs, rulesConfig, type ClosetTab, type Clothing, type Question, type Slot } from './gameData'
import { leaderboardService, type LeaderboardResponse } from './leaderboardService'
import { dictionaryColors, dictionaryItems } from './dictionaryData'
import SpineAvatar from './SpineAvatar.vue'

type Screen = 'intro' | 'lobby' | 'game' | 'result'
type Feedback = { kind: 'success' | 'error'; text: string; canAdvance?: boolean } | null
type Dialect = 'hak-sihien' | 'hak-hailu' | 'hak-dapu' | 'hak-raoping' | 'hak-zhaoan' | 'hak-namsihien'

const screen = ref<Screen>('intro')
const introStep = ref(0)
const gameSet = ref<Question[]>([])
const questionIndex = ref(0)
const activeTab = ref<ClosetTab>('tops')
const selected = ref<Partial<Record<Slot, string>>>({})
const feedback = ref<Feedback>(null)
const completed = ref(0)
const score = ref(0)
const questionScores = ref<Record<string, number>>({})
const elapsedMs = ref(0)
const leaderboard = ref<LeaderboardResponse | null>(null)
const pinyinField = ref<'color' | 'item'>('color')
const selectedDialect = ref<Dialect>('hak-sihien')
const closetItemIds = ref<Record<ClosetTab, string[]>>({ tops: [], bottoms: [], shoes: [], accessories: [] })
const dictionaryOpen = ref(false)
const dictionarySearch = ref('')
let timer: number | undefined

const dialects: { id: Dialect; label: string; hasVerifiedVocabulary: boolean }[] = [
  { id: 'hak-sihien', label: '四縣腔', hasVerifiedVocabulary: true },
  { id: 'hak-hailu', label: '海陸腔', hasVerifiedVocabulary: false },
  { id: 'hak-dapu', label: '大埔腔', hasVerifiedVocabulary: false },
  { id: 'hak-raoping', label: '饒平腔', hasVerifiedVocabulary: false },
  { id: 'hak-zhaoan', label: '詔安腔', hasVerifiedVocabulary: false },
  { id: 'hak-namsihien', label: '南四縣腔', hasVerifiedVocabulary: false },
]

const introScenes = [
  { tag: '假圖：intro_01_ready', speaker: '阿梅', text: '哇！我已經準備好出發囉！', mood: 'happy' },
  { tag: '假圖：intro_02_mom_warning', speaker: '媽媽', text: '阿梅！等一下，你確定要穿這樣出門嗎？看準天氣和場合，穿得舒服又體面，才不會變成災難焦點喔！', mood: 'surprised' },
  { tag: '假圖：intro_03_wrong_examples', speaker: '阿梅', text: '哎呀！如果穿錯衣服或選錯顏色，可就太尷尬了！造型師快來幫幫忙吧！', mood: 'worried' },
]

const bodySlotControls: { slot: Slot; label: string; tab: ClosetTab }[] = [
  { slot: 'head', label: '頭', tab: 'accessories' },
  { slot: 'neck', label: '頸', tab: 'accessories' },
  { slot: 'body', label: '身', tab: 'tops' },
  { slot: 'pants', label: '褲', tab: 'bottoms' },
  { slot: 'knee', label: '膝', tab: 'accessories' },
  { slot: 'shoes', label: '腳', tab: 'shoes' },
]

const currentQuestion = computed(() => gameSet.value[questionIndex.value])
const phase = computed(() => questionIndex.value < 5 ? 1 : 2)
const isPinyinQuestion = computed(() => phase.value === 2)
const targetIds = computed(() => Object.values(currentQuestion.value?.target ?? {}))
const promptTargetId = computed(() => {
  const question = currentQuestion.value
  if (!question) return undefined
  return Object.values(question.target).find((id) => {
    const item = clothing.find((entry) => entry.id === id)
    return item?.name === question.item && (!question.color || item.color === question.color)
  })
})
const promptTargetItem = computed(() => clothing.find((item) => item.id === promptTargetId.value))
const requiredSlots = computed<Slot[]>(() => {
  const q = currentQuestion.value
  if (!q) return ['body', 'pants', 'shoes']
  const isWater = q.tags?.includes('水上') || q.item === '泅水帽' || q.item === '泅水衫'
  const baseSlots: Slot[] = isWater ? ['body'] : ['body', 'pants', 'shoes']
  const targetSlot = promptTargetItem.value?.slot
  if (targetSlot && !baseSlots.includes(targetSlot)) {
    return [...baseSlots, targetSlot]
  }
  return baseSlots
})
const completedForQuestion = computed(() => {
  return Object.values(selected.value).filter(Boolean).length
})
function isSlotEquipped(slot: Slot) {
  if (selected.value[slot]) return true
  if (slot === 'pants') {
    const bodyId = selected.value['body']
    const bodyItem = clothing.find(c => c.id === bodyId)
    if (bodyItem?.name === '泅水衫') return true
  }
  return false
}
const filteredDictionaryItems = computed(() => {
  const query = dictionarySearch.value.trim().toLowerCase()
  if (!query) return dictionaryItems
  return dictionaryItems.filter((item) => `${item.name} ${item.pinyin} ${item.translation} ${item.description}`.toLowerCase().includes(query))
})

const questionText = computed(() => {
  const question = currentQuestion.value
  if (!question) return ''
  const hasColor = Boolean(question.color)
  const usePinyinForColor = isPinyinQuestion.value && hasColor && pinyinField.value === 'color'
  const usePinyinForItem = isPinyinQuestion.value && (!hasColor || pinyinField.value === 'item')

  const color = usePinyinForColor ? question.colorPinyin : question.color
  const item = usePinyinForItem ? question.itemPinyin : question.item
  const phrase = color ? `${color} 个 ${item}` : item
  return `${question.verb ?? '著'} ${phrase}${question.context}`
})

const seasonWeatherLabel = computed(() => {
  const tags = currentQuestion.value?.tags ?? []
  if (!currentQuestion.value) return ''
  const season = tags.includes('冷') ? '❄️ 冬天／冷' : '☀️ 夏天／熱'
  const rain = tags.includes('雨') || tags.includes('下雨') ? '・下雨' : ''
  const night = tags.includes('暗') ? '（晚上）' : ''
  return `${season}${rain}${night}`
})

const gameBackgroundStyle = computed(() => {
  const question = currentQuestion.value
  if (!question) return {}
  const tags = question.tags ?? []

  let bgImage = 'S2_m1_BGhot.png' // Default: 白天

  if (tags.includes('冷')) {
    bgImage = 'S2_m1_BGwinter.png' // 很冷
  } else if ((tags.includes('下雨') || tags.includes('rain')) && tags.includes('暗')) {
    bgImage = 'S2_m1_BGrain.png' // 晚上下雨
  } else if (tags.includes('雨') || tags.includes('下雨') || tags.includes('rain')) {
    bgImage = 'S2_m1_BGrain.png' // 下雨 (fallback to BGrain)
  } else if (tags.includes('暗') || tags.includes('晚上')) {
    bgImage = 'S2_m1_BGnight.png' // 晚上
  }

  return {
    backgroundImage: `url("${publicAssetUrl(`images-items/${bgImage}`)}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
})

const closetCards = computed(() => closetItemIds.value[activeTab.value]
  .map((id) => clothing.find((item) => item.id === id))
  .filter((item): item is Clothing => Boolean(item)))

const wornItems = computed(() => Object.entries(selected.value)
  .map(([, id]) => clothing.find((item) => item.id === id))
  .filter(Boolean))

// 平時接一般頭部；頭部插槽有帽類裝備時改用收髮版本，再疊加帽子圖層。
const activeHeadAsset = computed(() => selected.value.head ? 'head-swinA.png' : null)

const colorMap: Record<Clothing['colorKey'], string> = {
  blue: '#396f9e',
  yellow: '#f0be35',
  white: '#f8f2e8',
  black: '#36383d',
  orange: '#f47a21',
  purple: '#542480',
  red_flower_pattern: '#dc2626',
}

function publicAssetUrl(file: string) {
  return `${import.meta.env.BASE_URL}${file.replace(/^\/+/, '')}`
}

function assetUrl(file: string) {
  return publicAssetUrl(`images/${file}`)
}

function garmentStyle(item: Clothing, layer = item.wearLayers[0]) {
  return {
    '--garment-color': colorMap[item.colorKey],
    '--garment-mask': `url("${assetUrl(layer)}")`,
    '--garment-pattern': item.colorKey === 'red_flower_pattern' ? `url("${assetUrl('hakka_pattern.png')}")` : 'none',
  }
}

function shuffle<T>(values: T[]) {
  return [...values].sort(() => Math.random() - 0.5)
}

// 每個分頁最多顯示三件：題目正解必定保留，其餘從同分頁的全部物件隨機抽取。
// 因此每一個物件都有機會成為誘答，但不會讓正解消失。
function prepareCloset(question: Question | undefined) {
  const requiredIds = new Set(Object.values(question?.target ?? {}))
  const next: Record<ClosetTab, string[]> = { tops: [], bottoms: [], shoes: [], accessories: [] }

  for (const tab of tabs) {
    const inTab = clothing.filter((item) => item.tab === tab.id)
    const guaranteed = inTab.filter((item) => requiredIds.has(item.id))
    const distractors = shuffle(inTab.filter((item) => !requiredIds.has(item.id)))
    next[tab.id] = shuffle([...guaranteed, ...distractors.slice(0, Math.max(0, 3 - guaranteed.length))]).map((item) => item.id)
  }

  closetItemIds.value = next
}

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const milliseconds = Math.floor((ms % 1000) / 10)
  return `00:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`
}

function nextIntro() {
  if (introStep.value < introScenes.length - 1) introStep.value += 1
  else screen.value = 'lobby'
}

function selectTenDiverseQuestions(allQuestions: Question[]): Question[] {
  const groups: Record<string, Question[]> = {}
  for (const q of allQuestions) {
    if (!groups[q.item]) groups[q.item] = []
    groups[q.item].push(q)
  }

  // Score a question based on weather interest/rarity (3 = cold/winter, 2 = rain/water, 1 = normal)
  const getQuestionScore = (q: Question) => {
    if (q.tags?.includes('冷')) return 3
    if (q.tags?.includes('下雨') || q.tags?.includes('rain') || q.tags?.includes('水上')) return 2
    return 1
  }

  const sortedItems = Object.keys(groups).sort((a, b) => {
    const maxA = Math.max(...(groups[a] ?? []).map(getQuestionScore))
    const maxB = Math.max(...(groups[b] ?? []).map(getQuestionScore))
    return maxB - maxA
  })

  const result: Question[] = []

  // Prioritize picking questions with special weather for each item group
  for (const item of sortedItems) {
    if (result.length >= 10) break
    const qs = groups[item]
    if (qs && qs.length > 0) {
      // Sort questions within the group desc, and shuffle within the same score group
      const scoredQs = qs.map(q => ({ q, score: getQuestionScore(q) }))
      scoredQs.sort((x, y) => {
        if (y.score !== x.score) return y.score - x.score
        return Math.random() - 0.5
      })
      const bestQ = scoredQs[0]?.q
      if (bestQ) result.push(bestQ)
    }
  }

  // Fallback: If we still need more questions to reach 10, pick from remaining pool prioritizing special weather
  if (result.length < 10) {
    const remainingCount = 10 - result.length
    const alreadySelectedIds = new Set(result.map(q => q.id))
    const pool = allQuestions.filter(q => !alreadySelectedIds.has(q.id))
    const scoredPool = pool.map(q => ({ q, score: getQuestionScore(q) }))
    scoredPool.sort((x, y) => {
      if (y.score !== x.score) return y.score - x.score
      return Math.random() - 0.5
    })
    for (let i = 0; i < Math.min(remainingCount, scoredPool.length); i++) {
      result.push(scoredPool[i].q)
    }
  }

  return shuffle(result).slice(0, 10)
}

function startGame() {
  playSound('click')
  const nextGameSet = selectTenDiverseQuestions(questions)
  gameSet.value = nextGameSet
  questionIndex.value = 0
  selected.value = {}
  prepareCloset(nextGameSet[0])
  score.value = 0
  questionScores.value = {}
  completed.value = 0
  elapsedMs.value = 0
  feedback.value = null
  screen.value = 'game'
  window.clearInterval(timer)
  const startedAt = Date.now()
  timer = window.setInterval(() => { elapsedMs.value = Date.now() - startedAt }, 50)
}

const soundEnabled = ref(true)

function playSound(name: 'click' | 'false' | 'next') {
  if (!soundEnabled.value) return
  const files = {
    click: publicAssetUrl('music/S2_m2_click.mp3'),
    false: publicAssetUrl('music/S2_m2_false.mp3'),
    next: publicAssetUrl('music/S2_m2_next.mp3')
  }
  const audio = new Audio(files[name])
  audio.play().catch(err => console.log('Audio playback blocked/failed:', err))
}

function toggleSound() {
  soundEnabled.value = !soundEnabled.value
  playSound('click')
}

function chooseCard(id: string, slot: Slot) {
  playSound('click')
  const item = clothing.find(c => c.id === id)
  if (!item) return

  if (selected.value[slot] === id) {
    const next = { ...selected.value }
    delete next[slot]
    selected.value = next
  } else {
    const next = { ...selected.value }
    
    // Swimsuit (泅水衫) occupies both body and pants conceptually.
    if (item.name === '泅水衫') {
      delete next['pants']
    }
    
    if (slot === 'pants') {
      const currentBodyId = next['body']
      const currentBodyItem = clothing.find(c => c.id === currentBodyId)
      if (currentBodyItem?.name === '泅水衫') {
        delete next['body']
      }
    }

    next[slot] = id
    selected.value = next
  }
  feedback.value = null
}

function focusClosetSlot(tab: ClosetTab) {
  playSound('click')
  activeTab.value = tab
}

function clearSlot(slot: Slot) {
  playSound('click')
  if (!selected.value[slot]) return
  const next = { ...selected.value }
  delete next[slot]
  selected.value = next
  feedback.value = null
}

function resetOutfit() {
  playSound('click')
  selected.value = {}
  feedback.value = null
}

type ColorData = {
  name: string
  weather: string[]
  occasions: string[]
  blacklist: string[]
}

const colorDb: Record<string, ColorData> = {
  '黃色': { name: '黃色', weather: ['亮'], occasions: ['杭菊', '活潑', 'color'], blacklist: ['賞螢', '打掃'] },
  '白色': { name: '白色', weather: ['亮'], occasions: ['桐花', '杭菊', '正式', 'color'], blacklist: ['打掃'] },
  '烏色': { name: '烏色', weather: ['暗'], occasions: ['打掃', '正式', 'color'], blacklist: ['喜慶', '探親'] },
  '藍色': { name: '藍色', weather: [], occasions: ['color'], blacklist: [] },
  '固定藍染': { name: '固定藍染', weather: [], occasions: ['color'], blacklist: [] },
  '柑仔色': { name: '柑仔色', weather: ['亮'], occasions: ['活潑', 'color'], blacklist: ['賞螢', '打掃'] },
  '吊菜色': { name: '吊菜色', weather: ['亮', '暗'], occasions: ['日常', '活潑', 'color'], blacklist: [] },
  '紅色花圖案': { name: '紅色花圖案', weather: ['亮'], occasions: ['客庄', 'color'], blacklist: [] },
  'X': {
    name: 'X',
    weather: ['亮', '暗'],
    occasions: ['日常', '運動', '正式', '賞螢', '喜慶', '下雨', '水上', '桐花', '杭菊', '客庄', '打掃', '活潑', 'color'],
    blacklist: []
  }
}

function getRuleWarning(name: string, defaultWarning: string): string {
  const rule = rulesConfig.find(r => r.name === name)
  return rule?.warning || defaultWarning
}

function checkDressedDecency(q: Question, selectedMap: Partial<Record<Slot, string>>) {
  const isWater = q.tags?.includes('水上') || q.item === '泅水帽' || q.item === '泅水衫'
  const hasSwimsuit = Object.values(selectedMap).some(id => {
    const item = clothing.find(c => c.id === id)
    return item?.name === '泅水衫' || item?.name === '泅水帽'
  })

  const required: Slot[] = (isWater || hasSwimsuit) ? ['body'] : ['body', 'pants', 'shoes']
  const missing = required.filter(slot => !selectedMap[slot])
  return {
    complete: missing.length === 0
  }
}

const clothingOccasions = new Set(['日常', '運動', '正式', '喜慶'])

function validateItem(item: { name: string; type: string; weather: string[]; blacklist: string[]; occasions: string[]; verbs: string[] }, currentLevel: any, verb: string, isTargetCheck = false) {
  if (currentLevel.weather && !item.weather.includes(currentLevel.weather)) {
    return { valid: false, reason: `季節氣候不符：題目要求「${currentLevel.weather}」，但「${item.name}」僅適用「${item.weather.join(',')}」天氣。` }
  }

  for (const occasion of currentLevel.occasions) {
    if (occasion === '運動' && currentLevel.weather === '冷' && (item.name === '羽絨衫' || item.name === '膨線衫')) {
      continue
    }
    if (item.blacklist.includes(occasion)) {
      const customWarning = getRuleWarning(item.name, `觸發絕對黑名單：此題目場景為「${occasion}」，但「${item.name}」在此場合被禁用。`)
      return { valid: false, reason: customWarning }
    }
  }

  if (isTargetCheck) {
    if (!item.verbs.includes(verb)) {
      return { valid: false, reason: `動詞搭配錯誤：此處亮出動詞為「${verb}」，但「${item.name}」必須搭配「${item.verbs.join(', ')}」。` }
    }

    if (currentLevel.allowedItems && currentLevel.allowedItems.length > 0) {
      if (!currentLevel.allowedItems.includes(item.name)) {
        return { valid: false, reason: `題目限制：此題目指定必須搭配衣物為「${currentLevel.allowedItems.join(' 或 ')}」。` }
      }
    }
  }

  if (item.type === 'normal') {
    const isAllowed = currentLevel.allowedItems && currentLevel.allowedItems.includes(item.name)
    if (!isAllowed) {
      const activeOccasions = currentLevel.occasions.filter((occ: string) => clothingOccasions.has(occ))
      if (activeOccasions.length > 0) {
        const hasMatchingOccasion = activeOccasions.some((occ: string) => item.occasions.includes(occ))
        if (!hasMatchingOccasion) {
          const customWarning = getRuleWarning(item.name, `場合限制不符：「${item.name}」不符合題目要求的「${activeOccasions.join(',')}」。`)
          return { valid: false, reason: customWarning }
        }
      }
    }
  } else if (item.type === 'rain') {
    const isCleaning = currentLevel.occasions.includes('打掃') || currentLevel.colorThemes.includes('打掃')
    if (!currentLevel.isRaining && !isCleaning) {
      const customWarning = getRuleWarning('非雨天/非打掃穿雨鞋', `「水靴筒」為雨天或大掃除特規裝備，但此題目非下雨或打掃場景。`)
      return { valid: false, reason: customWarning }
    }
  } else if (item.type === 'water') {
    const isWaterLevel = currentLevel.occasions.includes('水上') || currentLevel.allowedItems?.includes('泅水帽') || currentLevel.allowedItems?.includes('泅水衫')
    if (!isWaterLevel) {
      const customWarning = getRuleWarning('非游泳穿泅水帽/衫', `「${item.name}」為水上活動特規裝備，但此題目非水上活動。`)
      return { valid: false, reason: customWarning }
    }
  }

  return { valid: true }
}

function validateColor(color: ColorData, currentLevel: any, isTargetCheck = false) {
  if (isTargetCheck && currentLevel.brightness) {
    if (!color.weather.includes(currentLevel.brightness)) {
      return { valid: false, reason: `色彩亮度不符：題目要求為「${currentLevel.brightness}」，但「${color.name}」屬於「${color.weather.join(',')}」。` }
    }
  }

  for (const occasion of currentLevel.occasions) {
    if (color.blacklist.includes(occasion)) {
      const customWarning = getRuleWarning(color.name, `顏色搭配衝突：此題涉及「${occasion}」，但「${color.name}」與該場合互斥。`)
      return { valid: false, reason: customWarning }
    }
  }

  if (isTargetCheck && currentLevel.colorThemes && currentLevel.colorThemes.length > 0) {
    const matchesTheme = currentLevel.colorThemes.some((theme: string) => color.occasions.includes(theme))
    if (!matchesTheme) {
      return { valid: false, reason: `花色主題不符：此題目要求特色主題「${currentLevel.colorThemes.join(',')}」，而「${color.name}」為「${color.occasions.join(',')}」屬性。` }
    }
  }

  if (isTargetCheck && currentLevel.allowedColors && currentLevel.allowedColors.length > 0) {
    if (!currentLevel.allowedColors.includes(color.name)) {
      return { valid: false, reason: `題目限制：此題目指定必須搭配顏色為「${currentLevel.allowedColors.join(' 或 ')}」。` }
    }
  }

  if (color.name !== 'X') {
    const targetOccasions = currentLevel.occasions.filter((occ: string) => occ !== '日常')
    if (targetOccasions.length > 0) {
      const colorsList = Object.values(colorDb)
      for (const occ of targetOccasions) {
        const anyColorHasOccasion = colorsList.some(c => c.name !== 'X' && c.occasions.includes(occ))
        if (anyColorHasOccasion) {
          if (!color.occasions.includes(occ)) {
            const customWarning = getRuleWarning(color.name, `顏色不符場合：此題場合為「${occ}」，但顏色「${color.name}」不具備該場合屬性。`)
            return { valid: false, reason: customWarning }
          }
        }
      }
    }
  }

  return { valid: true }
}

function checkSemanticConflict(verb: string, colorName: string, itemName: string, currentLevel: any, contextText: string) {
  if (itemName === '藍衫' && colorName !== 'X' && colorName !== '') {
    return {
      type: 'color-conflict',
      reason: getRuleWarning('藍衫重複染色', `「藍衫」本身已具備藍色，不可再搭配其他顏色形容詞。`)
    }
  }

  if (itemName === '長褲' && (contextText.includes('籃球') || contextText.includes('籃球時'))) {
    return {
      type: 'movement-restriction',
      reason: getRuleWarning('打籃球穿長褲', `語意不協調：打籃球要求手腳靈巧好活動，搭配「長褲」可能限制劇烈跑跳。`)
    }
  }

  const warmClothing = ['羽絨衫', '膨線衫', '頸圍仔']
  if (warmClothing.includes(itemName) && (currentLevel.weather === '熱' || contextText.includes('涼爽') || contextText.includes('熱'))) {
    return {
      type: 'seasonal-mismatch',
      reason: getRuleWarning('冬衣夏穿', `語意不協調：此題為炎熱/涼爽情境，搭配禦寒衣物「${itemName}」不合常理。`)
    }
  }

  const isCleaning = currentLevel.occasions.includes('打掃') || currentLevel.colorThemes.includes('打掃') || contextText.includes('大掃除') || contextText.includes('打掃')
  if (itemName === '水靴筒' && !currentLevel.isRaining && !contextText.includes('雨') && !isCleaning) {
    return {
      type: 'equipment-mismatch',
      reason: getRuleWarning('非雨天/非打掃穿雨鞋', `情境不協調：非下雨或打掃情境搭配雨鞋「水靴筒」不合語意。`)
    }
  }

  if ((itemName === '泅水帽' || itemName === '泅水衫') && !currentLevel.occasions.includes('水上') && !contextText.includes('泳')) {
    return {
      type: 'equipment-mismatch',
      reason: getRuleWarning('非游泳穿泅水帽/衫', `情境不協調：非水上活動情境搭配「泅水帽/泅水衫」不合語意。`)
    }
  }

  if ((itemName === '長褲' || itemName === '鞋') && contextText.includes('涼爽')) {
    return {
      type: 'seasonal-mismatch',
      reason: getRuleWarning('涼爽天氣穿長褲或包鞋', `語意不協調：此題敘事句強調「涼爽」，搭配「${itemName}」體感溫度較高，較不符合涼爽感。`)
    }
  }

  return null
}

function submitOutfit() {
  const question = currentQuestion.value
  if (!question) return

  const decency = checkDressedDecency(question, selected.value)
  if (!decency.complete) {
    playSound('false')
    feedback.value = { kind: 'error', text: '⚠️ 出門前記得上衣、下衣、鞋子都要穿好喲！' }
    return
  }

  const targetSlot = promptTargetItem.value?.slot ?? 'body'
  const equippedTargetId = selected.value[targetSlot]
  const equippedTargetItem = clothing.find(c => c.id === equippedTargetId)

  if (!equippedTargetItem) {
    playSound('false')
    feedback.value = { kind: 'error', text: '⚠️ 請先穿上適合該題目的衣物或配件！' }
    return
  }

  const verb = question.verb ?? '著'
  const itemName = equippedTargetItem.name
  const colorName = question.color ? equippedTargetItem.color : 'X'

  const isWaterLevel = question.tags?.includes('水上') || question.item === '泅水帽' || question.item === '泅水衫'
  const baseOccasions = question.tags?.filter(t => t !== '冷' && t !== '熱' && t !== '亮' && t !== '暗' && t !== 'rain' && t !== '下雨' && t !== 'color') || []
  if (isWaterLevel && !baseOccasions.includes('水上')) {
    baseOccasions.push('水上')
  }

  const currentLevel = {
    weather: question.tags?.find(t => t === '冷' || t === '熱') || '',
    brightness: question.tags?.find(t => t === '亮' || t === '暗') || '',
    isRaining: question.tags?.includes('rain') || question.tags?.includes('下雨') || false,
    occasions: baseOccasions,
    colorThemes: question.tags?.filter(t => ['桐花', '杭菊', '客庄', '打掃', '活潑'].includes(t)) || [],
    allowedVerbs: question.verb ? [question.verb] : [],
    allowedColors: question.color ? [question.color] : [],
    allowedItems: question.item ? [question.item] : []
  }

  let isValid = true
  let reasonText = ''

  if (!equippedTargetItem.verbs.includes(verb)) {
    isValid = false
    reasonText = question.errorPromptVerb || `動詞與衣物衝突：此處動詞為「${verb}」，但「${itemName}」不能搭配它。`
  }

  if (isValid) {
    const itemRes = validateItem(equippedTargetItem, currentLevel, verb, true)
    if (!itemRes.valid) {
      const isBlacklisted = currentLevel.occasions.some(occ => equippedTargetItem.blacklist.includes(occ))
      const isWeatherBad = currentLevel.weather && !equippedTargetItem.weather.includes(currentLevel.weather)
      if (isBlacklisted || isWeatherBad) {
        isValid = false
        reasonText = question.errorPromptItem || itemRes.reason || ''
      }
    }
  }

  if (isValid) {
    const colorObj = colorDb[equippedTargetItem.color]
    if (colorObj) {
      const colorRes = validateColor(colorObj, currentLevel, true)
      if (!colorRes.valid) {
        const isColorBlacklisted = currentLevel.occasions.some(occ => colorObj.blacklist.includes(occ))
        if (isColorBlacklisted) {
          isValid = false
          reasonText = question.errorPromptColor || colorRes.reason || ''
        }
      }
    }
  }

  if (isValid && itemName === '藍衫' && colorName !== 'X') {
    isValid = false
    reasonText = getRuleWarning('藍衫重複染色', '「藍衫」本身已具備藍色，不可再搭配其他顏色形容詞。')
  }

  const isItemMatch = currentLevel.allowedItems.includes(itemName)
  const isColorMatch = currentLevel.allowedColors.length === 0 || currentLevel.allowedColors.includes(colorName)
  const isTargetMatch = isItemMatch && isColorMatch

  // Contextual appropriateness check for EVERY dressed item
  let isContextMatch = true
  let contextReason = ''
  const equippedItems = Object.values(selected.value).map(id => clothing.find(c => c.id === id)).filter((c): c is Clothing => Boolean(c))

  for (const item of equippedItems) {
    const valRes = validateItem(item, currentLevel, item.verbs[0] || '著', false)
    if (!valRes.valid) {
      isContextMatch = false
      contextReason = `❌ 穿戴衣物不合時宜：模特兒身上穿的「${item.name}」不符合此場合（${valRes.reason}）。`
      break
    }
  }

  // Shivering / Sweating
  const warmItems = ['羽絨衫', '膨線衫', '頸圍仔']
  const hasWarmClothing = equippedItems.some(c => warmItems.includes(c.name))
  if (currentLevel.weather === '熱' && hasWarmClothing) {
    isContextMatch = false
    contextReason = '太陽好大！小主人汗流浹背！大夏天穿厚重的羽絨衫或膨線衫實在太悶熱了，快去幫模特兒換上舒適輕便的短衫吧！'
  }

  const coldItems = ['短衫', '短褲', '裙']
  const hasColdClothing = equippedItems.some(c => coldItems.includes(c.name))
  if (currentLevel.weather === '冷' && hasColdClothing) {
    isContextMatch = false
    contextReason = '冷風吹來～小主人在瑟瑟發抖！你雖然寫對了客語單字，但是冬天穿短袖短褲會著涼喔！快幫模特兒換成防寒的羽絨衫或長褲吧！'
  }

  // Semantic conflicts from the CSV
  if (isValid && isContextMatch) {
    const semanticErr = checkSemanticConflict(verb, colorName, itemName, currentLevel, question.context)
    if (semanticErr) {
      isContextMatch = false
      contextReason = semanticErr.reason
    }
  }

  // Determine final tier score (10, 6, 4, 0)
  let tier = 4
  if (isTargetMatch && isContextMatch) {
    tier = 1
  } else if (isTargetMatch && !isContextMatch) {
    tier = 2
  } else if (!isTargetMatch && isContextMatch) {
    tier = 3
  } else {
    tier = 4
  }

  const points = [0, 10, 6, 4, 0][tier]
  const firstAttempt = questionScores.value[question.id] === undefined

  if (firstAttempt) {
    questionScores.value = { ...questionScores.value, [question.id]: points }
    score.value += points
    if (tier === 1) completed.value += 1
  }

  if (tier === 1) {
    playSound('next')
    feedback.value = { kind: 'success', canAdvance: true, text: '🎉 完全正確！題目要求與情境都搭配得很好！' }
  } else {
    playSound('false')
    let text = ''
    if (tier === 2) {
      text = contextReason || question.errorPromptItem || question.errorPromptColor || '穿戴有些不符合當下天氣與場景喔，再檢查一下吧！'
    } else if (tier === 3) {
      text = '你的穿搭非常合適！但要注意：你寫在句子裡的單字，或是模特兒身上穿著的衣物，不是這道題目指定的搭配喔！快去選擇或給娃娃穿上這題指定的衣服吧！'
    } else {
      text = '再想一下！句子中的空格填寫不正確，且模特兒的穿戴也完全不符合當下的情境要求喔。'
    }
    feedback.value = { kind: 'error', canAdvance: true, text }
  }
}

function advanceQuestion(skipped = false) {
  playSound('click')
  if (skipped) feedback.value = { kind: 'error', text: '本題已跳過，獲得 0 分。' }
  if (questionIndex.value >= 9) {
    finishGame()
    return
  }
  const nextQuestionIndex = questionIndex.value + 1
  questionIndex.value = nextQuestionIndex
  selected.value = {}
  prepareCloset(gameSet.value[nextQuestionIndex])
  feedback.value = null
  activeTab.value = 'tops'
  pinyinField.value = Math.random() < 0.5 ? 'color' : 'item'
}

async function finishGame() {
  window.clearInterval(timer)
  leaderboard.value = await leaderboardService.submitGameResult(9, { score: score.value, elapsedMs: elapsedMs.value })
  screen.value = 'result'
}

async function showLeaderboard() {
  playSound('click')
  leaderboard.value = await leaderboardService.getLeaderboard(9)
  screen.value = 'result'
}

function replay() {
  playSound('click')
  screen.value = 'lobby'
}

onMounted(() => { pinyinField.value = Math.random() < 0.5 ? 'color' : 'item' })
onBeforeUnmount(() => window.clearInterval(timer))
</script>

<template>
  <main class="app-shell">
    <section v-if="screen === 'intro'" class="story-screen" :class="`scene-${introStep + 1}`">
      <div class="story-sun"></div>
      <div class="story-hills"></div>
      <div class="story-character-container">
        <img 
          :src="introScenes[introStep].speaker === '媽媽' ? publicAssetUrl('images-items/S2_m1_mom1.png') : publicAssetUrl('images-items/S2_m1_ame1.png')" 
          :class="['story-character-img', introScenes[introStep].mood]"
          alt="故事角色"
        />
      </div>
      <div v-if="introStep === 2" class="mistake-bubbles"><span>大熱天穿羽絨衣</span><span>婚禮穿全黑</span></div>
      <article class="dialogue-card">
        <small>{{ introScenes[introStep].speaker }}</small>
        <p>{{ introScenes[introStep].text }}</p>
        <div class="story-actions"><button class="primary" @click="nextIntro">{{ introStep === 2 ? '開始挑戰' : '繼續' }} ›</button><button class="text-button" @click="screen = 'lobby'">跳過故事情境 ››</button></div>
      </article>
    </section>

    <section v-else-if="screen === 'lobby'" class="lobby-screen">
      <button class="dictionary-launch" @click="dictionaryOpen = true">📖 穿搭小詞典<br><small>衣櫃與客語單字</small></button>
      <div class="lobby-card">
        <p class="eyebrow">✧ 阿梅的穿搭冒險</p><h1>歡迎來到 <span>穿搭小達人！</span></h1>
        <section class="lobby-info" aria-label="遊戲說明">
          <p class="lobby-intro">阿梅最愛出去玩，但出門前得先學會「看場合穿衣服」！翻開阿梅的衣櫃，發揮穿搭創意，幫阿梅避開尷尬的服裝災難，變身穿搭小達人吧！</p>
          <article class="info-block purpose"><b>▼ 遊玩提示</b><p>玩穿可事先閱讀課程學習，學習客語單字。</p></article>
          <article class="info-block rules"><b>▼ 遊玩計分</b><ol><li>總遊玩分數，一題 10 分。</li><li>根據題目選擇合適的穿著。</li><li>累計最高分及最快秒數為勝利。</li></ol></article>
          <p class="warning">⚠️　▼ 出門前記得上衣、下衣、鞋子都要穿好喲！</p>
        </section>
        <div class="dialects"><button v-for="dialect in dialects" :key="dialect.id" :class="{ selected: selectedDialect === dialect.id }" :aria-pressed="selectedDialect === dialect.id" @click="selectedDialect = dialect.id">{{ dialect.label }}</button></div>
        <button class="primary start" @click="startGame">開始遊戲</button>
        <button class="text-button rank-link" @click="showLeaderboard">查看排行榜</button>
      </div>
    </section>

    <section v-else-if="screen === 'game'" class="game-screen" :style="gameBackgroundStyle">
      <header class="toolbar"><button class="icon-button" @click="screen = 'lobby'">⌂</button><span>？</span><button class="text-button sound-toggle-btn" @click="toggleSound">{{ soundEnabled ? '🔊 音效：開' : '🔇 音效：關' }}</button><strong>⏱ {{ formatTime(elapsedMs) }}</strong></header>
      <aside class="mission-card"><span class="progress">第 {{ questionIndex + 1 }}/10 題・第 {{ phase }} 階段</span><h2>{{ seasonWeatherLabel }}</h2><p>{{ questionText }}</p></aside>
      <section class="avatar-zone"><nav class="body-controls" aria-label="部位衣櫃捷徑"><div v-for="control in bodySlotControls" :key="control.slot" class="body-control"><button type="button" :class="{ equipped: isSlotEquipped(control.slot) }" @click="focusClosetSlot(control.tab)">{{ control.label }}</button></div></nav><SpineAvatar :outfit="selected" /></section>
      <aside class="closet-card"><nav><button v-for="tab in tabs" :key="tab.id" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id"><b>{{ tab.icon }}</b>{{ tab.label }}</button></nav><div class="clothing-grid"><button v-for="card in closetCards" :key="card.id" class="clothing-card" :class="{ selected: selected[card.slot] === card.id }" :aria-label="`${card.color} ${card.name}`" @click="chooseCard(card.id, card.slot)"><span class="clothing-thumbnail" :class="{ 'fixed-color': card.colorMode === 'fixed' }" :style="garmentStyle(card, card.closetImage)"><i class="thumbnail-dye"></i><i v-if="card.colorKey === 'red_flower_pattern'" class="thumbnail-pattern"></i><img class="clothing-card-image" :src="assetUrl(card.closetImage)" alt=""></span></button></div><div class="closet-footer"><strong>完成搭配 <span :class="{ 'count-error': completedForQuestion > requiredSlots.length }">{{ completedForQuestion }}</span>/{{ requiredSlots.length }}</strong><button class="primary" @click="submitOutfit">送出搭配</button><button class="secondary" @click="resetOutfit">重置服裝</button><button class="secondary" @click="advanceQuestion(true)">跳過這題</button></div></aside>
      <div v-if="feedback" class="feedback" :class="feedback.kind"><p>{{ feedback.text }}</p><button v-if="feedback.canAdvance" class="primary" @click="advanceQuestion()">{{ questionIndex === 9 ? '查看成績' : '下一題' }}</button></div>
    </section>

    <section v-else class="result-screen">
      <div class="result-card"><p class="eyebrow">成績結算</p><h1>{{ score === 100 ? '完美穿搭師' : score >= 60 ? '時尚觀察員' : '穿搭初學者' }}</h1><p>總分 {{ score }} 分　・　花費時間 {{ formatTime(elapsedMs) }}</p><p class="result-comment">{{ score === 100 ? '無懈可擊！你的搭配精準符合所有環境限制。' : '多觀察天氣與場合，再試一次一定會更好！' }}</p><button class="primary" @click="replay">重玩一次</button></div>
      <section class="ranking-card"><h2>排行榜 <small>Mock 資料</small></h2><div class="rank-head"><span>排名</span><span>學員</span><span>分數</span><span>計時</span></div><div v-for="entry in leaderboard?.entries" :key="`${entry.rank}-${entry.displayName}`" class="rank-row" :class="{ mine: entry.displayName === '測○○' }"><span>{{ entry.rank }}</span><span>{{ entry.displayName }}</span><span>{{ entry.score }}</span><span>{{ formatTime(entry.elapsedMs) }}</span></div><p class="rank-foot">目前共 {{ leaderboard?.participantCount ?? 0 }} 人參加，共玩 {{ leaderboard?.playCount ?? 0 }} 次</p></section>
    </section>

    <section v-if="dictionaryOpen" class="dictionary-overlay" role="dialog" aria-modal="true" aria-label="穿搭小詞典" @click.self="dictionaryOpen = false">
      <article class="dictionary-modal">
        <header><div><h2>📖 客庄衣著小詞典</h2><p>學習正宗客家穿衣名詞與發音</p></div><button aria-label="關閉詞典" @click="dictionaryOpen = false">×</button></header>
        <div class="dictionary-search"><span>⌕</span><input v-model="dictionarySearch" placeholder="搜尋客語名詞、華語翻譯或拼音…"><button v-if="dictionarySearch" @click="dictionarySearch = ''">重設</button></div>
        <div class="dictionary-content"><div v-if="filteredDictionaryItems.length" class="dictionary-grid"><article v-for="item in filteredDictionaryItems" :key="item.name" class="dictionary-item"><div class="dictionary-image"><img :src="assetUrl(item.image)" :alt="item.name"></div><div><b>{{ item.name }}</b><p class="dictionary-pinyin">拼音：{{ item.pinyin }}</p><p>釋義：{{ item.translation }}</p><p class="dictionary-knowledge"><span>小知識</span>{{ item.description }}</p></div></article></div><p v-else class="dictionary-empty">找不到「{{ dictionarySearch }}」相關詞彙。</p><section class="dictionary-colors"><h3>🎨 客語顏色名詞</h3><div><article v-for="color in dictionaryColors" :key="color.name"><i :class="{ pattern: color.pattern }" :style="{ '--color': color.hex }"></i><p class="dictionary-pinyin">{{ color.pinyin }}</p><b>{{ color.name }}</b><small>（{{ color.translation }}）</small></article></div></section></div>
        <footer><button class="secondary" @click="dictionaryOpen = false">關閉詞典</button></footer>
      </article>
    </section>
  </main>
</template>
