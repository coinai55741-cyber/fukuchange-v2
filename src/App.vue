<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { clothing, questions, tabs, rulesConfig, feedbackMessages, feedbackMessageRecords, type ClosetTab, type Clothing, type Question, type Slot } from './gameData'
import { leaderboardService, type LeaderboardResponse } from './leaderboardService'
import { getDictionaryItems } from './dictionaryData'
import SpineAvatar from './SpineAvatar.vue'

type Screen = 'intro' | 'lobby' | 'game' | 'result'
type Feedback = { kind: 'success' | 'error'; text: string; canAdvance?: boolean } | null
type Dialect = 'hak-sihien' | 'hak-hailu' | 'hak-dapu' | 'hak-raoping' | 'hak-zhaoan' | 'hak-namsihien'
type QuestionReview = {
  id: string
  index: number
  score: number
  passed: boolean
  skipped: boolean
  targetMatched: boolean
  contextMistakes: string[]
  themeTitle: string
  hakkaBadge: string
  description: string
  outfitSnapshotImage: string
  outfitSnapshotAlt: string
  questionDisplay: string
  playerSentence: string
  correctSentence: string
  feedbackTitle: string
  feedbackText: string
  suggestion: string
}

const screen = ref<Screen>('intro')
const introStep = ref(0)
const gameSet = ref<Question[]>([])
const questionIndex = ref(0)
const activeTab = ref<ClosetTab>('tops')
const selected = ref<Partial<Record<Slot, string>>>({})
const avatarRef = ref<InstanceType<typeof SpineAvatar> | null>(null)
const feedback = ref<Feedback>(null)
const completed = ref(0)
const score = ref(0)
const questionScores = ref<Record<string, number>>({})
const questionReviews = ref<QuestionReview[]>([])
const elapsedMs = ref(0)
const leaderboard = ref<LeaderboardResponse | null>(null)
const pinyinField = ref<'color' | 'item'>('color')
const selectedDialect = ref<Dialect>('hak-sihien')
const closetItemIds = ref<Record<ClosetTab, string[]>>({ tops: [], bottoms: [], shoes: [], accessories: [] })
const dictionaryOpen = ref(false)
const dictionarySearch = ref('')
const lobbyLeaderboardOpen = ref(false)
const isMobileViewport = ref(false)
let mobileMediaQuery: MediaQueryList | null = null
const dictionaryDialogRef = ref<HTMLElement | null>(null)
const feedbackDialogRef = ref<HTMLElement | null>(null)
const lobbyLeaderboardDialogRef = ref<HTMLElement | null>(null)
let lastFocusedElement: HTMLElement | null = null

function rememberFocus() {
  lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null
}

function restoreFocus() {
  const target = lastFocusedElement
  lastFocusedElement = null
  requestAnimationFrame(() => target?.focus())
}

async function focusDialog(dialogRef: { value: HTMLElement | null }) {
  await nextTick()
  dialogRef.value?.focus()
}

function openLobbyLeaderboard() {
  playSound('click')
  rememberFocus()
  lobbyLeaderboardOpen.value = true
  void focusDialog(lobbyLeaderboardDialogRef)
}

function closeLobbyLeaderboard() {
  playSound('click')
  lobbyLeaderboardOpen.value = false
  restoreFocus()
}let timer: number | undefined
let bgmAudio: HTMLAudioElement | undefined

const dialects: { id: Dialect; label: string; hasVerifiedVocabulary: boolean }[] = [
  { id: 'hak-sihien', label: '四縣腔', hasVerifiedVocabulary: true },
  { id: 'hak-hailu', label: '海陸腔', hasVerifiedVocabulary: false },
  { id: 'hak-dapu', label: '大埔腔', hasVerifiedVocabulary: false },
  { id: 'hak-raoping', label: '饒平腔', hasVerifiedVocabulary: false },
  { id: 'hak-zhaoan', label: '詔安腔', hasVerifiedVocabulary: false },
  { id: 'hak-namsihien', label: '南四縣腔', hasVerifiedVocabulary: false },
]

const introScenes = [
  { tag: 'intro_01_ready', speaker: '阿梅', text: '哇！我已經準備好出發囉！', mood: 'happy', image: 'S2_m1_ame1.png' },
  { tag: 'intro_02_mom_warning', speaker: '媽媽', text: '阿梅！等一下，你確定要穿這樣出門嗎？看準天氣和場合，穿得舒服又體面，才不會變成災難焦點喔！', mood: 'surprised', image: 'S2_m1_mom1.png' },
  { tag: 'intro_03_wrong_examples', speaker: '阿梅', text: '哎呀！如果穿錯衣服或選錯顏色，可就太尷尬了！造型師快來幫幫忙吧！', mood: 'worried', image: 'S2_m1_ame2.png' },
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
const lobbyRankEntries = computed(() => leaderboard.value?.entries.slice(0, 5) ?? [])
const resultRankEntries = computed(() => leaderboard.value?.entries.slice(0, 10) ?? [])
const myResultEntry = computed(() => leaderboard.value?.myEntry)
const showMyRankBelowTopTen = computed(() => {
  const mine = myResultEntry.value
  return Boolean(mine && mine.rank > 10)
})
const resultTitle = computed(() => score.value === 100 ? '完美穿搭師' : score.value >= 60 ? '時尚觀察員' : '穿搭初學者')
const resultComment = computed(() => score.value === 100 ? '無懈可擊！你的搭配精準符合所有環境限制，細節與美感更是全場焦點。' : '多觀察天氣與場合，再試一次一定會更好！')

function isSlotEquipped(slot: Slot) {
  if (selected.value[slot]) return true
  if (slot === 'pants') {
    const bodyId = selected.value['body']
    const bodyItem = clothing.find(c => c.id === bodyId)
    if (bodyItem?.name === '泅水衫') return true
  }
  return false
}

function seasonalWeatherForQuestion(question?: Question | null) {
  const tags = question?.tags ?? []
  return tags.includes('冷') ? '冷' : '熱'
}

const dictionaryEntries = computed(() => getDictionaryItems(selectedDialect.value))
const dictionaryItems = computed(() => dictionaryEntries.value.filter(item => item.type === 'item'))
const dictionaryColors = computed(() => dictionaryEntries.value.filter(item => item.type === 'color'))

const filteredDictionaryItems = computed(() => {
  const query = dictionarySearch.value.trim().toLowerCase()
  if (!query) return dictionaryItems.value
  return dictionaryItems.value.filter((item) => `${item.name} ${item.pinyin} ${item.translation} ${item.description}`.toLowerCase().includes(query))
})

const hakkaBadgeText = computed(() => {
  const question = currentQuestion.value
  if (!question) return ''
  const hasColor = Boolean(question.color)
  const usePinyinForColor = isPinyinQuestion.value && hasColor && pinyinField.value === 'color'
  const usePinyinForItem = isPinyinQuestion.value && (!hasColor || pinyinField.value === 'item')

  const color = usePinyinForColor ? question.colorPinyin : question.color
  const item = usePinyinForItem ? question.itemPinyin : question.item
  const phrase = color ? `${color}个${item}` : item
  return `${question.verb ?? '著'}${phrase}`
})

const questionDescriptionText = computed(() => currentQuestion.value?.context.replace(/^，/, '') ?? '')

const questionText = computed(() => {
  const question = currentQuestion.value
  if (!question) return ''
  return `${hakkaBadgeText.value}${question.context}`
})

const seasonWeatherLabel = computed(() => {
  const tags = currentQuestion.value?.tags ?? []
  if (!currentQuestion.value) return ''
  const weather = seasonalWeatherForQuestion(currentQuestion.value)
  const season = weather === '冷' ? '❄️ 冬天／冷' : '☀️ 夏天／熱'
  const night = tags.includes('暗') ? '（晚上）' : ''
  return `${season}${night}`
})

function backgroundImageForQuestion(question: Question, mobile = false) {
  const tags = question.tags ?? []
  const prefix = mobile ? 'MB' : 'BG'

  if (tags.includes('冷')) return `S2_m1_${prefix}winter.png`
  if (tags.includes('雨') || tags.includes('下雨') || tags.includes('rain')) return `S2_m1_${prefix}rain.png`
  if (tags.includes('暗') || tags.includes('晚上')) return `S2_m1_${prefix}night.png`
  return `S2_m1_${prefix}hot.png`
}

const gameBackgroundStyle = computed(() => {
  const question = currentQuestion.value
  if (!question) return {}
  const bgImage = backgroundImageForQuestion(question, isMobileViewport.value)

  return {
    backgroundImage: `url("${publicAssetUrl(`images-items/${bgImage}`)}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
})

const introBackgroundStyle = computed(() => ({
  backgroundImage: `url("${publicAssetUrl('images-items/S2_m1_BG1.png')}")`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
}))

const resultBackgroundStyle = computed(() => ({
  backgroundImage: `url("${publicAssetUrl('images-items/S2_m1_BG3.png')}")`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed'
}))

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

function preloadImageFiles(files: string[]) {
  if (typeof Image === 'undefined') return
  files.forEach((file) => {
    const image = new Image()
    image.src = publicAssetUrl(file)
  })
}

function preloadIntroImages() {
  preloadImageFiles([
    ...introScenes.map((scene) => `images-items/${scene.image}`),
    'images-items/S2_m2_clould1.png',
    'images-items/S2_m2_clould2.png',
  ])
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

function preferredDistractorsForQuestion(question: Question | undefined, tab: ClosetTab, inTab: Clothing[], requiredIds: Set<string>) {
  if (!question) return []
  const targetIds = Object.values(question.target ?? {})
  const asksRainBoots = question.item?.includes('水靴筒') || targetIds.some((id) => id.startsWith('rain-boots') || id === 'shoes-rain')
  const asksSwimCap = question.item?.includes('泅水帽') || targetIds.some((id) => id.startsWith('swim-cap') || id === 'head-swim-cap-yellow')

  if (tab === 'shoes' && asksRainBoots) {
    return shuffle(inTab.filter((item) => item.id.startsWith('rain-boots-') && !requiredIds.has(item.id)))
  }

  if (tab === 'accessories' && asksSwimCap) {
    return shuffle(inTab.filter((item) => item.id.startsWith('swim-cap-') && item.colorKey !== 'yellow' && !requiredIds.has(item.id)))
  }

  return []
}

// 每個分頁最多顯示三件：題目正解必定保留，其餘從同分頁的全部物件隨機抽取。
// 因此每一個物件都有機會成為誘答，但不會讓正解消失。
function prepareCloset(question: Question | undefined) {
  const requiredIds = new Set(Object.values(question?.target ?? {}))
  const next: Record<ClosetTab, string[]> = { tops: [], bottoms: [], shoes: [], accessories: [] }

  for (const tab of tabs) {
    const inTab = clothing.filter((item) => item.tab === tab.id)
    const guaranteed = inTab.filter((item) => requiredIds.has(item.id))
    const preferred = preferredDistractorsForQuestion(question, tab.id, inTab, requiredIds)
    const preferredIds = new Set(preferred.map((item) => item.id))
    const distractors = [
      ...preferred,
      ...shuffle(inTab.filter((item) => !requiredIds.has(item.id) && !preferredIds.has(item.id)))
    ]
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

function formatRankTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function nextIntro() {
  playSound('click')
  if (introStep.value < introScenes.length - 1) introStep.value += 1
  else screen.value = 'lobby'
}

function goToScreen(nextScreen: Screen, sound: 'click' | 'false' | 'next' = 'click') {
  playSound(sound)
  screen.value = nextScreen
}

function openDictionary() {
  playSound('click')
  rememberFocus()
  dictionaryOpen.value = true
  void focusDialog(dictionaryDialogRef)
}

function closeDictionary() {
  playSound('click')
  dictionaryOpen.value = false
  restoreFocus()
}
function selectDialect(dialect: Dialect) {
  playSound('click')
  selectedDialect.value = dialect
}

function resetDictionarySearch() {
  playSound('click')
  dictionarySearch.value = ''
}

function selectTenDiverseQuestions(allQuestions: Question[]): Question[] {
  const questionCategory = (question: Question) => {
    const tags = question.tags ?? []
    const hasCold = tags.includes('冷')
    const hasRain = tags.includes('下雨') || tags.includes('rain')
    const hasWater = tags.includes('水上') || tags.includes('water')
    if (tags.includes('打掃')) return 'cleaning'
    if (hasCold && hasRain) return 'cold-rain'
    if (hasCold) return 'cold'
    if (hasRain) return 'rain'
    if (hasWater) return 'water'
    if (tags.includes('賞螢') || tags.includes('暗')) return 'night'
    if (tags.includes('藍衫') || tags.includes('客庄') || tags.includes('桐花') || tags.includes('杭菊')) return 'culture'
    if (tags.includes('喜慶')) return 'event'
    if (tags.includes('正式')) return 'formal'
    if (tags.includes('運動')) return 'sport'
    if (tags.includes('亮') || tags.includes('活潑')) return 'style'
    if (tags.includes('日常')) return 'daily'
    return 'other'
  }

  const categoryWeight = (category: string) => {
    if (category === 'cold-rain') return 2.4
    if (category === 'cleaning') return 2.2
    if (category === 'cold' || category === 'rain' || category === 'water') return 2
    if (category === 'night' || category === 'culture') return 1.6
    return 1
  }

  const usedPromptKeys = new Set<string>()
  const usedPromptItems = new Set<string>()
  const usedPromptColors = new Set<string>()
  const promptKey = (question: Question) => `${question.item}::${question.color || '無色'}`

  const pickQuestions = (poolQuestions: Question[], targetCount: number, priorityCategories: string[]) => {
    const result: Question[] = []
    const selectedIds = new Set<string>()
    const poolPromptItems = new Set<string>()
    const poolPromptColors = new Set<string>()
    const itemCounts = new Map<string, number>()
    const categoryCounts = new Map<string, number>()
    const maxSameItem = 2
    const maxSameCategory = 2

    const canUseQuestion = (question: Question, relaxItemLimit = false, relaxCategoryLimit = false, relaxPromptLimit = false) => {
      if (selectedIds.has(question.id)) return false
      const category = questionCategory(question)
      const color = question.color || '無色'
      if (!relaxPromptLimit && usedPromptKeys.has(promptKey(question))) return false
      if (!relaxPromptLimit && poolPromptItems.has(question.item)) return false
      if (!relaxPromptLimit && poolPromptColors.has(color)) return false
      if (!relaxPromptLimit && usedPromptItems.has(question.item)) return false
      if (!relaxPromptLimit && usedPromptColors.has(color)) return false
      if (!relaxItemLimit && (itemCounts.get(question.item) ?? 0) >= maxSameItem) return false
      if (!relaxCategoryLimit && (categoryCounts.get(category) ?? 0) >= maxSameCategory) return false
      return true
    }

    const addQuestion = (question: Question) => {
      const category = questionCategory(question)
      result.push(question)
      selectedIds.add(question.id)
      usedPromptKeys.add(promptKey(question))
      usedPromptItems.add(question.item)
      usedPromptColors.add(question.color || '無色')
      poolPromptItems.add(question.item)
      poolPromptColors.add(question.color || '無色')
      itemCounts.set(question.item, (itemCounts.get(question.item) ?? 0) + 1)
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1)
    }

    const pickWeightedQuestion = (candidates: Question[]) => {
      const weighted = candidates.map((question) => ({ question, weight: categoryWeight(questionCategory(question)) }))
      const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0)
      let cursor = Math.random() * totalWeight
      for (const entry of weighted) {
        cursor -= entry.weight
        if (cursor <= 0) return entry.question
      }
      return weighted.at(-1)?.question
    }

    for (const category of priorityCategories) {
      if (result.length >= targetCount) break
      const candidates = shuffle(poolQuestions.filter((question) => questionCategory(question) === category && canUseQuestion(question)))
      const question = pickWeightedQuestion(candidates)
      if (question) addQuestion(question)
    }

    while (result.length < targetCount) {
      const candidates = shuffle(poolQuestions.filter((question) => canUseQuestion(question)))
      const question = pickWeightedQuestion(candidates)
      if (!question) break
      addQuestion(question)
    }

    while (result.length < targetCount) {
      const candidates = shuffle(poolQuestions.filter((question) => canUseQuestion(question, false, false, true)))
      const question = pickWeightedQuestion(candidates)
      if (!question) break
      addQuestion(question)
    }

    while (result.length < targetCount) {
      const candidates = shuffle(poolQuestions.filter((question) => canUseQuestion(question, true, true, true)))
      const question = pickWeightedQuestion(candidates)
      if (!question) break
      addQuestion(question)
    }

    return shuffle(result).slice(0, targetCount)
  }

  const pool1Questions = allQuestions.filter((question) => question.pool === 1)
  const pool2Questions = allQuestions.filter((question) => question.pool === 2)
  const pool1 = pickQuestions(pool1Questions.length ? pool1Questions : allQuestions, 5, shuffle(['cold-rain', 'cold', 'rain', 'water', 'night', 'culture']))
  const pool2 = pickQuestions(pool2Questions.length ? pool2Questions : allQuestions, 5, ['cleaning', ...shuffle(['cold-rain', 'cold', 'rain', 'water', 'night', 'culture', 'formal', 'event', 'style'])])

  return [...pool1, ...pool2]
}
function startGame() {
  playSound('next')
  const nextGameSet = selectTenDiverseQuestions(questions)
  gameSet.value = nextGameSet
  questionIndex.value = 0
  selected.value = {}
  prepareCloset(nextGameSet[0])
  score.value = 0
  questionScores.value = {}
  questionReviews.value = []
  completed.value = 0
  elapsedMs.value = 0
  feedback.value = null
  screen.value = 'game'
  window.clearInterval(timer)
  const startedAt = Date.now()
  timer = window.setInterval(() => { elapsedMs.value = Date.now() - startedAt }, 50)
}

const soundEnabled = ref(true)
const soundToggleLabel = computed(() => soundEnabled.value ? '音效按鈕，目前開啟，點擊關閉音效' : '音效按鈕，目前關閉，點擊開啟音效')

function ensureBgm() {
  if (!soundEnabled.value) return
  if (!bgmAudio) {
    bgmAudio = new Audio(publicAssetUrl('music/S2_m2_bgmloop.mp3'))
    bgmAudio.loop = true
    bgmAudio.volume = 0.32
  }
  if (bgmAudio.paused) {
    bgmAudio.play().catch(err => console.log('Background music playback blocked/failed:', err))
  }
}

function playSound(name: 'click' | 'false' | 'next') {
  if (!soundEnabled.value) return
  ensureBgm()
  const files = {
    click: publicAssetUrl('music/S2_m2_click.mp3'),
    false: publicAssetUrl('music/S2_m2_false.mp3'),
    next: publicAssetUrl('music/S2_m2_next.mp3')
  }
  const audio = new Audio(files[name])
  audio.play().catch(err => console.log('Audio playback blocked/failed:', err))
}

function toggleSound() {
  if (soundEnabled.value) {
    playSound('click')
    soundEnabled.value = false
    bgmAudio?.pause()
  } else {
    soundEnabled.value = true
    playSound('click')
  }
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

function handleClosetTabKeydown(event: KeyboardEvent, tabId: ClosetTab) {
  const tabIndex = tabs.findIndex((tab) => tab.id === tabId)
  if (tabIndex === -1) return

  let nextIndex = tabIndex
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    nextIndex = (tabIndex + 1) % tabs.length
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    nextIndex = (tabIndex - 1 + tabs.length) % tabs.length
  } else if (event.key === 'Home') {
    nextIndex = 0
  } else if (event.key === 'End') {
    nextIndex = tabs.length - 1
  } else {
    return
  }

  event.preventDefault()
  const nextTab = tabs[nextIndex]
  activeTab.value = nextTab.id
  playSound('click')
  nextTick(() => {
    document.getElementById(`closet-tab-${nextTab.id}`)?.focus()
  })
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

function feedbackMessage(key: string, fallback: string, replacements: Record<string, string> = {}) {
  const template = feedbackMessages[key] || fallback
  return Object.entries(replacements).reduce((text, [name, value]) => text.split(`{${name}}`).join(value), template)
}

function feedbackMeta(key: string) {
  return feedbackMessageRecords.find((record) => record.key === key)
}

function splitQuestionValues(value?: string) {
  return (value ?? '').split(',').map((item) => item.trim()).filter(Boolean)
}

function outfitSentence(question: Question, outfit: Partial<Record<Slot, string>>) {
  const targetSlot = promptTargetItem.value?.slot ?? Object.keys(question.target)[0] as Slot | undefined
  const item = targetSlot ? clothing.find((entry) => entry.id === outfit[targetSlot]) : undefined
  if (!item) return '未完成穿搭'
  const color = question.color ? item.color : ''
  return `${question.verb ?? '著'} ${color ? `${color}个` : ''}${item.name}${question.context}`
}

function reviewHakkaBadge(question: Question, index: number) {
  const hasColor = Boolean(question.color)
  const isReviewPinyinQuestion = index >= 5
  const usePinyinForColor = isReviewPinyinQuestion && hasColor && pinyinField.value === 'color'
  const usePinyinForItem = isReviewPinyinQuestion && (!hasColor || pinyinField.value === 'item')
  const color = usePinyinForColor ? question.colorPinyin : question.color
  const item = usePinyinForItem ? question.itemPinyin : question.item
  const phrase = color ? `${color}个${item}` : item
  return `${question.verb ?? '著'}${phrase}`
}

function reviewThemeTitle(question: Question) {
  const weather = seasonalWeatherForQuestion(question)
  const season = weather === '冷' ? '❄️ 冬天／冷' : '☀️ 夏天／熱'
  const night = question.tags?.includes('暗') ? '（晚上）' : ''
  return `${season}${night}`
}

function reviewDescription(question: Question) {
  return question.context.replace(/^，/, '')
}

function captureOutfitSnapshot() {
  const captured = avatarRef.value?.capture?.()
  if (captured) return captured

  const canvas = document.querySelector<HTMLCanvasElement>('.spine-avatar canvas')
  if (!canvas) return ''
  try {
    return canvas.toDataURL('image/png')
  } catch (error) {
    console.warn('Unable to capture outfit snapshot:', error)
    return ''
  }
}

function outfitSnapshotAlt(skipped: boolean) {
  if (skipped) return '本題已跳過，沒有穿搭快照'
  const items = Object.values(selected.value)
    .map(id => clothing.find(item => item.id === id))
    .filter((item): item is Clothing => Boolean(item))
    .map(item => `${item.color !== '無' ? `${item.color}个` : ''}${item.name}`)
  return items.length ? `本題玩家穿搭快照：${items.join('、')}` : '本題玩家穿搭快照'
}

function questionDisplaySentence(question: Question, index: number) {
  const hasColor = Boolean(question.color)
  const isReviewPinyinQuestion = index >= 5
  const usePinyinForColor = isReviewPinyinQuestion && hasColor && pinyinField.value === 'color'
  const usePinyinForItem = isReviewPinyinQuestion && (!hasColor || pinyinField.value === 'item')
  const color = usePinyinForColor ? question.colorPinyin : question.color
  const item = usePinyinForItem ? question.itemPinyin : question.item
  const phrase = color ? `${color} 个 ${item}` : item
  return `${question.verb ?? '著'} ${phrase}${question.context}`
}

function correctSentence(question: Question) {
  const targetId = promptTargetId.value ?? Object.values(question.target)[0]
  const item = clothing.find((entry) => entry.id === targetId)
  if (!item) return `${question.verb ?? '著'} ${question.color ? `${question.color}个` : ''}${question.item}${question.context}`
  const color = question.color ? item.color : ''
  return `${question.verb ?? '著'} ${color ? `${color}个` : ''}${item.name}${question.context}`
}

function recordQuestionReview(question: Question, points: number, passed: boolean, skipped: boolean, feedbackKey: string, feedbackText: string, targetMatched = passed, contextMistakes: string[] = []) {
  if (questionReviews.value.some((review) => review.id === question.id)) return
  const meta = feedbackMeta(feedbackKey)
  questionReviews.value = [
    ...questionReviews.value,
    {
      id: question.id,
      index: questionIndex.value + 1,
      score: points,
      passed,
      skipped,
      targetMatched,
      contextMistakes,
      themeTitle: reviewThemeTitle(question),
      hakkaBadge: skipped ? '本題已跳過' : reviewHakkaBadge(question, questionIndex.value),
      description: reviewDescription(question),
      outfitSnapshotImage: skipped ? '' : captureOutfitSnapshot(),
      outfitSnapshotAlt: outfitSnapshotAlt(skipped),
      questionDisplay: skipped ? '本題已跳過' : questionDisplaySentence(question, questionIndex.value),
      playerSentence: skipped ? '本題已跳過' : outfitSentence(question, selected.value),
      correctSentence: correctSentence(question),
      feedbackTitle: meta?.title || (passed ? '完全正確' : skipped ? '已跳過' : '不符合要求'),
      feedbackText,
      suggestion: meta?.suggestion || correctSentence(question)
    }
  ]
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
    return { valid: false, reason: feedbackMessage('item_weather_mismatch', `季節氣候不符：題目要求「${currentLevel.weather}」，但「${item.name}」僅適用「${item.weather.join(',')}」天氣。`, { weather: currentLevel.weather, item: item.name, itemWeather: item.weather.join(',') }) }
  }

  for (const occasion of currentLevel.occasions) {
    if (occasion === '運動' && currentLevel.weather === '冷' && (item.name === '羽絨衫' || item.name === '膨線衫')) {
      continue
    }
    if (item.blacklist.includes(occasion)) {
      return { valid: false, reason: feedbackMessage('item_blacklist_mismatch', `此題目場景為「${occasion}」，但「${item.name}」不符合此場合喔！`, { occasion, item: item.name }) }
    }
  }

  if (isTargetCheck) {
    if (!item.verbs.includes(verb)) {
      return { valid: false, reason: feedbackMessage('item_verb_mismatch', `動詞搭配錯誤：此處亮出動詞為「${verb}」，但「${item.name}」必須搭配「${item.verbs.join(', ')}」。`, { verb, item: item.name, itemVerbs: item.verbs.join(', ') }) }
    }

    if (currentLevel.allowedItems && currentLevel.allowedItems.length > 0) {
      if (!currentLevel.allowedItems.includes(item.name)) {
        return { valid: false, reason: feedbackMessage('item_requirement_mismatch', `題目限制：此題目指定必須搭配衣物為「${currentLevel.allowedItems.join(' 或 ')}」。`, { allowedItems: currentLevel.allowedItems.join(' 或 ') }) }
      }
    }
  }

  if (item.type === 'rain') {
    const isCleaning = currentLevel.occasions.includes('打掃') || currentLevel.colorThemes.includes('打掃')
    if (!currentLevel.isRaining && !isCleaning) {
      return { valid: false, reason: feedbackMessage('rain_boot_context_mismatch', `「水靴筒」並非此場景穿戴物喔！`) }
    }
  } else if (item.type === 'water') {
    const isWaterLevel = currentLevel.occasions.includes('水上') || currentLevel.allowedItems?.includes('泅水帽') || currentLevel.allowedItems?.includes('泅水衫')
    if (!isWaterLevel) {
      return { valid: false, reason: feedbackMessage('water_context_mismatch', `「${item.name}」為水上活動的裝備。`, { item: item.name }) }
    }
  }

  return { valid: true }
}

function validateColor(color: ColorData, currentLevel: any, isTargetCheck = false) {
  if (isTargetCheck && currentLevel.brightness) {
    if (!color.weather.includes(currentLevel.brightness)) {
      return { valid: false, reason: feedbackMessage('color_brightness_mismatch', `色彩亮度不符：題目要求為「${currentLevel.brightness}」，但「${color.name}」屬於「${color.weather.join(',')}」。`, { brightness: currentLevel.brightness, color: color.name, colorWeather: color.weather.join(',') }) }
    }
  }

  for (const occasion of currentLevel.occasions) {
    if (color.blacklist.includes(occasion)) {
      const customWarning = getRuleWarning(color.name, feedbackMessage('color_occasion_conflict', `顏色搭配衝突：此題涉及「${occasion}」，但「${color.name}」與該場合互斥。`, { occasion, color: color.name }))
      return { valid: false, reason: customWarning }
    }
  }

  if (isTargetCheck && currentLevel.colorThemes && currentLevel.colorThemes.length > 0) {
    const matchesTheme = currentLevel.colorThemes.some((theme: string) => color.occasions.includes(theme))
    if (!matchesTheme) {
      return { valid: false, reason: feedbackMessage('color_theme_mismatch', `花色主題不符：此題目要求特色主題「${currentLevel.colorThemes.join(',')}」，而「${color.name}」為「${color.occasions.join(',')}」屬性。`, { colorThemes: currentLevel.colorThemes.join(','), color: color.name, colorOccasions: color.occasions.join(',') }) }
    }
  }

  if (isTargetCheck && currentLevel.allowedColors && currentLevel.allowedColors.length > 0) {
    if (!currentLevel.allowedColors.includes(color.name)) {
      return { valid: false, reason: feedbackMessage('color_requirement_mismatch', `題目限制：此題目指定必須搭配顏色為「${currentLevel.allowedColors.join(' 或 ')}」。`, { allowedColors: currentLevel.allowedColors.join(' 或 ') }) }
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
            const customWarning = getRuleWarning(color.name, feedbackMessage('color_context_mismatch', `顏色不符場合：此題場合為「${occ}」，但顏色「${color.name}」不具備該場合屬性。`, { occasion: occ, color: color.name }))
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
    feedback.value = { kind: 'error', text: feedbackMessage('missing_required_outfit', '出門前記得上衣、下衣、鞋子都要穿好喲！') }
    return
  }

  const targetSlot = promptTargetItem.value?.slot ?? 'body'
  const equippedTargetId = selected.value[targetSlot]
  const equippedTargetItem = clothing.find(c => c.id === equippedTargetId)

  if (!equippedTargetItem) {
    playSound('false')
    feedback.value = { kind: 'error', text: feedbackMessage('missing_target_item', '⚠️ 請先穿上適合該題目的衣物或配件！') }
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
    allowedColors: splitQuestionValues(question.color),
    allowedItems: splitQuestionValues(question.item)
  }
  const seasonalWeather = seasonalWeatherForQuestion(question)

  let isValid = true
  let reasonText = ''

  if (!equippedTargetItem.verbs.includes(verb)) {
    isValid = false
    reasonText = question.errorPromptVerb || feedbackMessage('verb_item_conflict', `動詞與衣物衝突：此處動詞為「${verb}」，但「${itemName}」不能搭配它。`, { verb, item: itemName })
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
  let contextMistakes: string[] = []
  const equippedItems = Object.values(selected.value).map(id => clothing.find(c => c.id === id)).filter((c): c is Clothing => Boolean(c))

  for (const item of equippedItems) {
    const valRes = validateItem(item, currentLevel, item.verbs[0] || '著', false)
    if (!valRes.valid) {
      isContextMatch = false
      contextMistakes = [`${item.color !== '無' ? `${item.color}个` : ''}${item.name}`]
      contextReason = valRes.reason || feedbackMessage('worn_item_context_mismatch', `穿戴衣物不合時宜：阿梅身上穿的「${item.name}」不符合此場合。`, { item: item.name, reason: '' })
      break
    }
  }

  // Shivering / Sweating
  const warmItems = ['羽絨衫', '膨線衫', '頸圍仔']
  const warmClothing = equippedItems.filter(c => warmItems.includes(c.name))
  if (seasonalWeather === '熱' && warmClothing.length > 0) {
    isContextMatch = false
    contextMistakes = warmClothing.map(item => `${item.color !== '無' ? `${item.color}个` : ''}${item.name}`)
    contextReason = feedbackMessage('hot_with_warm_clothing', '太陽好大！小主人汗流浹背！大夏天穿厚重的羽絨衫或膨線衫實在太悶熱了，快去幫模特兒換上舒適輕便的短衫吧！')
  }

  const coldItems = ['短衫', '短褲', '裙']
  const coldClothing = equippedItems.filter(c => coldItems.includes(c.name))
  if (seasonalWeather === '冷' && coldClothing.length > 0) {
    isContextMatch = false
    contextMistakes = coldClothing.map(item => `${item.color !== '無' ? `${item.color}个` : ''}${item.name}`)
    contextReason = feedbackMessage('cold_with_summer_clothing', '冷風吹來～小主人在瑟瑟發抖！你雖然寫對了客語單字，但是冬天穿短袖短褲會著涼喔！快幫模特兒換成防寒的羽絨衫或長褲吧！')
  }

  // Semantic conflicts from the CSV
  if (isValid && isContextMatch) {
    const semanticErr = checkSemanticConflict(verb, colorName, itemName, currentLevel, question.context)
    if (semanticErr) {
      isContextMatch = false
      contextMistakes = [`${colorName !== 'X' && colorName !== '無' ? `${colorName}个` : ''}${itemName}`]
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
    const successText = feedbackMessage('tier_success', '🎉 完全正確！題目要求與情境都搭配得很好！')
    if (firstAttempt) recordQuestionReview(question, points, true, false, 'tier_success', successText, true)
    playSound('next')
    feedback.value = { kind: 'success', canAdvance: true, text: successText }
  } else {
    playSound('false')
    let text = ''
    let feedbackKey = 'tier_target_and_context_wrong'
    if (tier === 2) {
      feedbackKey = contextReason ? 'tier_context_wrong_default' : 'tier_context_wrong_default'
      text = contextReason || question.errorPromptItem || question.errorPromptColor || feedbackMessage('tier_context_wrong_default', '穿戴有些不符合當下天氣與場景喔，再檢查一下吧！')
    } else if (tier === 3) {
      feedbackKey = 'tier_target_wrong_context_right'
      text = feedbackMessage('tier_target_wrong_context_right', '你的穿搭非常合適！但要注意：你寫在句子裡的單字，或是模特兒身上穿著的衣物，不是這道題目指定的搭配喔！快去選擇或給娃娃穿上這題指定的衣服吧！')
    } else {
      feedbackKey = 'tier_target_and_context_wrong'
      text = feedbackMessage('tier_target_and_context_wrong', '再想一下！句子中的空格填寫不正確，且模特兒的穿戴也完全不符合當下的情境要求喔。')
    }
    if (firstAttempt) recordQuestionReview(question, points, false, false, feedbackKey, text, isTargetMatch, contextMistakes)
    feedback.value = { kind: 'error', canAdvance: true, text }
  }
}

function advanceQuestion(skipped = false) {
  playSound('click')
  if (skipped) {
    const question = currentQuestion.value
    const text = feedbackMessage('skip_question', '本題已跳過，獲得 0 分。')
    if (question && questionScores.value[question.id] === undefined) {
      questionScores.value = { ...questionScores.value, [question.id]: 0 }
      recordQuestionReview(question, 0, false, true, 'skip_question', text, false, [])
    }
    feedback.value = { kind: 'error', text }
  }
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

function closeFeedback() {
  feedback.value = null
  restoreFocus()
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

async function loadLobbyLeaderboard() {
  leaderboard.value = await leaderboardService.getLeaderboard(9)
}

function replay() {
  playSound('click')
  screen.value = 'lobby'
}

function updateMobileViewport(event?: MediaQueryListEvent) {
  isMobileViewport.value = event?.matches ?? Boolean(mobileMediaQuery?.matches)
}
function handleGlobalKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  if (feedback.value) {
    event.preventDefault()
    closeFeedback()
    return
  }
  if (dictionaryOpen.value) {
    event.preventDefault()
    closeDictionary()
    return
  }
  if (lobbyLeaderboardOpen.value) {
    event.preventDefault()
    closeLobbyLeaderboard()
  }
}

watch(feedback, (value) => {
  if (!value) return
  rememberFocus()
  void focusDialog(feedbackDialogRef)
})

onMounted(() => {
  pinyinField.value = Math.random() < 0.5 ? 'color' : 'item'
  void loadLobbyLeaderboard()
  preloadIntroImages()
  preloadImageFiles(['images-items/S2_m1_MBhot.png', 'images-items/S2_m1_MBnight.png', 'images-items/S2_m1_MBwinter.png', 'images-items/S2_m1_MBrain.png'])
  mobileMediaQuery = window.matchMedia('(max-width: 760px)')
  updateMobileViewport()
  mobileMediaQuery.addEventListener('change', updateMobileViewport)
  window.addEventListener('keydown', handleGlobalKeydown)
})
onBeforeUnmount(() => {
  window.clearInterval(timer)
  window.removeEventListener('keydown', handleGlobalKeydown)
  mobileMediaQuery?.removeEventListener('change', updateMobileViewport)
  bgmAudio?.pause()
})
</script>

<template>
  <main class="app-shell">
    <div class="orientation-notice" role="status" aria-live="polite">
      <div>
        <p>建議將裝置旋轉為橫向後開始遊玩</p>
      </div>
    </div>
    <section v-if="screen === 'intro'" class="story-screen" :class="`scene-${introStep + 1}`" :style="introBackgroundStyle">
      <header class="lobby-toolbar" aria-label="前導故事工具列">
        <button class="lobby-back-button" type="button" aria-label="返回列表" @click="goToScreen('lobby')"><img :src="publicAssetUrl('ui/back.png')" alt="" aria-hidden="true">返回列表</button>
        <button class="text-button sound-toggle-btn" type="button" :aria-pressed="soundEnabled" :aria-label="soundToggleLabel" :title="soundToggleLabel" @click="toggleSound"><img :src="publicAssetUrl(soundEnabled ? 'ui/sound-icon.svg' : 'ui/sound-off-icon.svg')" alt="" aria-hidden="true">音效</button>
      </header>
      <div class="story-character-container">
        <img 
          :src="publicAssetUrl(`images-items/${introScenes[introStep].image}`)"
          :class="['story-character-img', introScenes[introStep].mood]"
           :alt="`${introScenes[introStep].speaker}角色立繪`"
        />
      </div>
      <div v-if="introStep === 2" class="mistake-bubbles" role="group" aria-label="錯誤穿搭範例">
        <figure>
          <img :src="publicAssetUrl('images-items/S2_m2_clould1.png')" alt="" aria-hidden="true">
          <figcaption>大熱天穿羽絨衣</figcaption>
        </figure>
        <figure>
          <img :src="publicAssetUrl('images-items/S2_m2_clould2.png')" alt="" aria-hidden="true">
          <figcaption>參與婚禮穿全黑</figcaption>
        </figure>
      </div>
      <article class="dialogue-card">
        <small>{{ introScenes[introStep].speaker }}</small>
        <p>{{ introScenes[introStep].text }}</p>
        <div class="story-actions"><button class="primary" type="button" @click="nextIntro">{{ introStep === 2 ? '開始挑戰' : '繼續' }} ›</button><button class="text-button" type="button" @click="goToScreen('lobby')">跳過故事情境 ››</button></div>
      </article>
    </section>

    <section v-else-if="screen === 'lobby'" class="lobby-screen" :style="introBackgroundStyle">
      <header class="lobby-toolbar" aria-label="首頁工具列">
        <button class="lobby-back-button" type="button" aria-label="返回列表" @click="goToScreen('intro')"><img :src="publicAssetUrl('ui/back.png')" alt="" aria-hidden="true">返回列表</button>
        <button class="text-button sound-toggle-btn" type="button" :aria-pressed="soundEnabled" :aria-label="soundToggleLabel" :title="soundToggleLabel" @click="toggleSound"><img :src="publicAssetUrl(soundEnabled ? 'ui/sound-icon.svg' : 'ui/sound-off-icon.svg')" alt="" aria-hidden="true">音效</button>
        <button class="text-button lobby-rank-toggle-btn" type="button" @click="openLobbyLeaderboard"><span class="star-icon">★</span> 排行榜</button>
      </header>
      <!-- 桌機版詞典衣櫃按鈕 -->
      <button class="dictionary-launch dictionary-image-launch desktop-only-dictionary" type="button" @click="openDictionary" aria-label="開啟穿搭小詞典，阿梅的衣櫃" aria-describedby="dictionary-launch-help"><img :src="publicAssetUrl('images-items/S2_m2_clodet.png')" alt="" aria-hidden="true"><span id="dictionary-launch-help" class="dictionary-launch-tooltip" role="tooltip">開啟穿搭小詞典</span></button>

      <!-- 手機直式專用詞典/衣櫃按鈕 -->
      <button class="mobile-dictionary-btn" type="button" @click="openDictionary" aria-label="穿搭小詞典，阿梅的衣櫃">
        <div class="mobile-dictionary-btn-avatar">
          <img :src="publicAssetUrl('images-items/S2_m1_ame1.png')" alt="阿梅">
        </div>
        <span class="mobile-dictionary-btn-text">阿梅的衣櫃</span>
      </button>
      <div class="lobby-card">
        <h1>歡迎來到 <span>穿搭小達人！</span></h1>
        <section class="lobby-info" aria-label="遊戲說明">
          <p class="lobby-intro">阿梅最愛出去玩，但出門前得先學會「看場合穿衣服」！翻開阿梅的衣櫃，發揮穿搭創意，幫阿梅避開尷尬的服裝災難，變身穿搭小達人吧！</p>
          <article class="info-block purpose"><b>▼ 遊玩提示</b><p>可在左方【穿搭小詞典】學習衣著單字喔！</p></article>
          <article class="info-block rules"><b>▼ 遊玩計分</b><ol><li>總遊玩分數，一題 10 分。</li><li>根據題目選擇合適的穿著。</li><li>累計最高分及最快秒數為勝利。</li></ol></article>
          <p class="warning">▼ 出門前記得上衣、下衣、鞋子都要穿好喲！</p>
        </section>
        <section class="dialect-panel" aria-label="選擇腔調別">
          <h2>選擇腔調別</h2>
          <div class="dialects"><button v-for="dialect in dialects" :key="dialect.id" :class="{ selected: selectedDialect === dialect.id }" :aria-pressed="selectedDialect === dialect.id" @click="selectDialect(dialect.id)">{{ dialect.label }}<img v-if="selectedDialect === dialect.id" class="dialect-check-icon" :src="publicAssetUrl('ui/check-circle.png')" alt="" aria-hidden="true"></button></div>
        </section>
        <button class="primary start" type="button" @click="startGame">開始遊戲</button>
      </div>
      <aside class="lobby-leaderboard" aria-label="即時排行榜">
        <img class="lobby-rank-banner" :src="publicAssetUrl('ui/rank_banner.png')" alt="即時排行榜">
        <div class="lobby-rank-summary">
          <p>您目前的排名：<b>{{ leaderboard?.myEntry?.rank ?? '--' }}</b></p>
          <p>最佳紀錄：<b>{{ leaderboard?.myEntry ? formatTime(leaderboard.myEntry.elapsedMs) : '--' }}</b></p>
        </div>
        <button class="lobby-rank-link" type="button" @click="showLeaderboard">查看總排名</button>
        <ol>
          <li v-for="entry in lobbyRankEntries" :key="`${entry.rank}-${entry.displayName}`">
            <span class="lobby-rank-place" tabindex="0" :aria-label="`第 ${entry.rank} 名，${entry.displayName}，計時 ${formatRankTime(entry.elapsedMs)}，分數 ${entry.score}`">
              <img v-if="entry.rank <= 3" :src="publicAssetUrl(`ui/icon_rank${entry.rank}.png`)" :alt="`第 ${entry.rank} 名${entry.rank === 1 ? '金牌' : entry.rank === 2 ? '銀牌' : '銅牌'}`">
              <span v-if="entry.rank <= 3" class="sr-only">第 {{ entry.rank }} 名</span>
              <b v-else>{{ entry.rank }}</b>
            </span>
            <span class="lobby-rank-name">{{ entry.displayName }}</span>
            <time>{{ formatRankTime(entry.elapsedMs) }}</time>
          </li>
        </ol>
      </aside>
    </section>

    <section v-else-if="screen === 'game'" class="game-screen" :style="gameBackgroundStyle">
      <h1 class="sr-only">穿搭小達人遊戲關卡</h1>
      <header class="toolbar">
        <div class="lobby-toolbar game-top-actions" aria-label="遊戲工具列">
          <button class="lobby-back-button" type="button" aria-label="返回列表" @click="goToScreen('lobby')"><img :src="publicAssetUrl('ui/back.png')" alt="" aria-hidden="true">返回列表</button>
          <button class="text-button sound-toggle-btn" type="button" :aria-pressed="soundEnabled" :aria-label="soundToggleLabel" :title="soundToggleLabel" @click="toggleSound"><img :src="publicAssetUrl(soundEnabled ? 'ui/sound-icon.svg' : 'ui/sound-off-icon.svg')" alt="" aria-hidden="true">音效</button>
        </div>
        <strong>⏱ {{ formatTime(elapsedMs) }}</strong>
      </header>
      <aside class="mission-card"><span class="progress">第 {{ questionIndex + 1 }}/10 題・第 {{ phase }} 階段</span><h2>{{ seasonWeatherLabel }}</h2><div class="question-badge">{{ hakkaBadgeText }}</div><p class="question-description">{{ questionDescriptionText }}</p></aside>
      <section class="avatar-zone"><nav class="body-controls" aria-label="部位衣櫃捷徑"><div v-for="control in bodySlotControls" :key="control.slot" class="body-control"><button type="button" :class="{ equipped: isSlotEquipped(control.slot) }" :aria-pressed="isSlotEquipped(control.slot)" :aria-label="`${control.label}部位，${isSlotEquipped(control.slot) ? '已穿搭' : '尚未穿搭'}，點擊前往衣櫃`" @click="focusClosetSlot(control.tab)">{{ control.label }}</button></div></nav><SpineAvatar ref="avatarRef" :outfit="selected" /></section>
      <aside class="closet-card"><nav role="tablist" aria-label="衣櫃分類"><button v-for="tab in tabs" :id="`closet-tab-${tab.id}`" :key="tab.id" role="tab" :aria-selected="activeTab === tab.id" :aria-controls="`closet-panel-${tab.id}`" :class="{ active: activeTab === tab.id }" @click="focusClosetSlot(tab.id)" @keydown="handleClosetTabKeydown($event, tab.id)"><b aria-hidden="true">{{ tab.icon }}</b>{{ tab.label }}</button></nav><div v-for="tab in tabs" :key="`panel-${tab.id}`" class="clothing-grid" role="tabpanel" :id="`closet-panel-${tab.id}`" :aria-labelledby="`closet-tab-${tab.id}`" :hidden="activeTab !== tab.id"><template v-if="activeTab === tab.id"><button v-for="card in closetCards" :key="card.id" class="clothing-card" :class="{ selected: selected[card.slot] === card.id }" :aria-label="`${card.color} ${card.name}`" :aria-pressed="selected[card.slot] === card.id" @click="chooseCard(card.id, card.slot)"><span class="clothing-thumbnail" :class="{ 'fixed-color': card.colorMode === 'fixed' }" :style="garmentStyle(card, card.closetImage)"><i class="thumbnail-dye"></i><i v-if="card.colorKey === 'red_flower_pattern'" class="thumbnail-pattern"></i><img class="clothing-card-image" :src="assetUrl(card.closetImage)" alt="" aria-hidden="true"></span></button></template></div><div class="closet-footer"><strong role="status" aria-live="polite">完成搭配 <span :class="{ 'count-error': completedForQuestion > requiredSlots.length }">{{ completedForQuestion }}</span>/{{ requiredSlots.length }}</strong><button class="primary" type="button" @click="submitOutfit">送出搭配</button><button class="secondary" type="button" @click="resetOutfit">重置服裝</button><button class="secondary" type="button" @click="advanceQuestion(true)">跳過這題</button></div></aside>
      <div v-if="feedback" class="feedback-modal-overlay" role="dialog" aria-modal="true" aria-label="作答提示" @click.self="closeFeedback">
        <div ref="feedbackDialogRef" class="feedback" :class="feedback.kind" tabindex="-1">
          <button class="feedback-close" type="button" aria-label="關閉提示" @click="closeFeedback">×</button>
          <p>{{ feedback.text }}</p>
          <button v-if="feedback.canAdvance" class="primary" type="button" @click="advanceQuestion()">{{ questionIndex === 9 ? '查看成績' : '下一題' }}</button>
        </div>
      </div>
    </section>

    <section v-else class="result-screen" :style="resultBackgroundStyle">
      <header class="lobby-toolbar" aria-label="結算頁工具列">
        <button class="lobby-back-button" type="button" aria-label="返回列表" @click="goToScreen('lobby')"><img :src="publicAssetUrl('ui/back.png')" alt="" aria-hidden="true">返回列表</button>
        <button class="text-button sound-toggle-btn" type="button" :aria-pressed="soundEnabled" :aria-label="soundToggleLabel" :title="soundToggleLabel" @click="toggleSound"><img :src="publicAssetUrl(soundEnabled ? 'ui/sound-icon.svg' : 'ui/sound-off-icon.svg')" alt="" aria-hidden="true">音效</button>
      </header>
      <article class="result-panel">
        <section class="result-summary-card">
          <h1>恭喜過關！</h1>
          <p class="result-comment">{{ resultComment }}</p>
          <div class="result-avatar-placeholder" aria-hidden="true">
            <img :src="publicAssetUrl(score === 100 ? 'images-items/S2_m2_result_mom5.png' : score >= 60 ? 'images-items/S2_m2_result_mom3.png' : 'images-items/S2_m2_result_mom1.png')" alt="">
          </div>
          <div class="result-badge">
            <span>{{ dialects.find(d => d.id === selectedDialect)?.label ?? '四縣腔' }}</span>
            <b>{{ resultTitle }}</b>
          </div>
          <div class="result-metrics">
            <div><b>名次</b><span>{{ myResultEntry ? `第${myResultEntry.rank}名` : '--' }}</span></div>
            <div><b>花費時間</b><span>{{ formatTime(elapsedMs) }}</span></div>
            <div><b>總分數</b><span>{{ score }}分</span></div>
            <button type="button" aria-label="查看總排行" @click="showLeaderboard">總排行 ›</button>
          </div>
          <div class="result-actions result-summary-actions">
            <button class="secondary" type="button" @click="goToScreen('lobby')">返回列表</button>
            <button class="primary result-replay" type="button" @click="replay">重玩一次</button>
          </div>
        </section>
        <section class="result-ranking-card">
          <h2>排行榜</h2>
          <div class="result-rank-head"><span>排名</span><span>學員</span><span>分數</span><span>計時</span></div>
          <ol class="result-rank-list">
            <li v-for="entry in resultRankEntries" :key="`${entry.rank}-${entry.displayName}`" :class="{ mine: entry.displayName === myResultEntry?.displayName }">
              <span class="result-rank-place" tabindex="0" :aria-label="`第 ${entry.rank} 名，${entry.displayName}，計時 ${formatRankTime(entry.elapsedMs)}，分數 ${entry.score}`">
                <img v-if="entry.rank <= 3" :src="publicAssetUrl(`ui/icon_rank${entry.rank}.png`)" :alt="`第 ${entry.rank} 名${entry.rank === 1 ? '金牌' : entry.rank === 2 ? '銀牌' : '銅牌'}`">
                <span v-if="entry.rank <= 3" class="sr-only">第 {{ entry.rank }} 名</span>
                <b v-else>{{ entry.rank }}</b>
              </span>
              <span>{{ entry.displayName }}</span>
              <span>{{ entry.score }}</span>
              <time>{{ formatRankTime(entry.elapsedMs) }}</time>
            </li>
            <template v-if="showMyRankBelowTopTen && myResultEntry">
              <li class="result-rank-ellipsis" aria-hidden="true"><span>·</span><span>·</span><span>·</span></li>
              <li class="mine out-of-top-ten">
                <span class="result-rank-place" tabindex="0" :aria-label="`第 ${myResultEntry.rank} 名，${myResultEntry.displayName}，計時 ${formatRankTime(myResultEntry.elapsedMs)}，分數 ${myResultEntry.score}`"><b>{{ myResultEntry.rank }}</b></span>
                <span>{{ myResultEntry.displayName }}</span>
                <span>{{ myResultEntry.score }}</span>
                <time>{{ formatRankTime(myResultEntry.elapsedMs) }}</time>
              </li>
            </template>
          </ol>
          <p class="rank-foot">目前共 <b>{{ leaderboard?.participantCount ?? 0 }}</b> 人參加，共玩 <b>{{ leaderboard?.playCount ?? 0 }}</b> 次</p>
          <aside class="result-ranking-note">
            <b>注意事項</b>
            <ol>
              <li>同分且作答時間相同時，依活動參加先後進行排序。</li>
              <li>本遊戲獎項僅頒發第 1–6 名；第 7–10 名請再接再厲！</li>
            </ol>
          </aside>
        </section>
        <section class="sentence-review-card">
          <h2>穿搭造句檢視</h2>
          <div class="sentence-review-list">
            <article v-for="review in questionReviews" :key="review.id" class="sentence-review-item" :class="{ passed: review.passed, failed: !review.passed }">
              <header>
                <b>第{{ review.index }}題</b>
                <div class="sentence-review-badges">
                  <span>得分：{{ review.score }} 分</span>
                  <em>{{ review.passed ? '✓ 已通關' : review.skipped ? '— 已跳過' : '✕ 未通關' }}</em>
                </div>
              </header>
              <div class="sentence-review-layout" :class="{ skipped: review.skipped }">
                <figure v-if="!review.skipped" class="sentence-outfit-snapshot" :class="{ empty: !review.outfitSnapshotImage }">
                  <img v-if="review.outfitSnapshotImage" :src="review.outfitSnapshotImage" :alt="review.outfitSnapshotAlt">
                  <figcaption v-else>{{ review.skipped ? '未留下穿搭快照' : '快照擷取失敗' }}</figcaption>
                </figure>
                <div class="sentence-review-detail">
                  <div class="sentence-question-block">
                    <h3>{{ review.themeTitle }}</h3>
                    <p class="sentence-question-badge">{{ review.hakkaBadge }}</p>
                    <p class="sentence-question-description">{{ review.description }}</p>
                  </div>
                  <div v-if="!review.passed && !review.skipped" class="sentence-hint">
                    <template v-if="!review.skipped">
                      <b>{{ review.feedbackTitle }}</b>
                      <p>{{ review.feedbackText }}</p>
                    </template>
                    <div v-if="review.targetMatched && review.contextMistakes.length" class="sentence-context-mistakes">
                      <small>這次主要不合適的穿戴：</small>
                      <p>{{ review.contextMistakes.join('、') }}</p>
                    </div>
                  </div>
                  <div v-if="review.passed && !review.skipped" class="sentence-hint success">
                    <b>{{ review.feedbackTitle }}</b>
                    <p>{{ review.suggestion }}</p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      </article>
    </section>

    <section v-if="dictionaryOpen" class="dictionary-overlay" role="dialog" aria-modal="true" aria-labelledby="dictionary-title" @click.self="closeDictionary">
      <article ref="dictionaryDialogRef" class="dictionary-modal" tabindex="-1">
        <header>
          <div><h2 id="dictionary-title">穿搭小詞典</h2></div>
          <div class="dictionary-header-actions">
            <select v-model="selectedDialect" aria-label="選擇客語腔調">
              <option v-for="dialect in dialects" :key="dialect.id" :value="dialect.id">{{ dialect.label }}</option>
            </select>
            <button type="button" aria-label="關閉穿搭小詞典" @click="closeDictionary">×</button>
          </div>
        </header>
        <div class="dictionary-search"><span>⌕</span><input v-model="dictionarySearch" aria-label="搜尋客語名詞、華語翻譯或拼音" placeholder="搜尋客語名詞、華語翻譯或拼音…"><button v-if="dictionarySearch" type="button" @click="resetDictionarySearch">重設</button></div>
        <div class="dictionary-content"><div v-if="filteredDictionaryItems.length" class="dictionary-grid"><article v-for="item in filteredDictionaryItems" :key="item.name" class="dictionary-item"><div class="dictionary-image"><img :src="assetUrl(item.image)" :alt="item.name"></div><div><b>{{ item.name }}</b><p class="dictionary-pinyin">拼音：{{ item.pinyin }}</p><p>釋義：{{ item.translation }}</p><p class="dictionary-knowledge"><span>小知識</span>{{ item.description }}</p></div></article></div><p v-else class="dictionary-empty">找不到「{{ dictionarySearch }}」相關詞彙。</p><section class="dictionary-colors"><h3>客語顏色名詞</h3><div class="dictionary-grid"><article v-for="color in dictionaryColors" :key="color.name" class="dictionary-item dictionary-color-item"><div class="dictionary-image dictionary-color-image"><i :class="{ pattern: color.pattern }" :style="color.pattern ? { '--color': color.hex, '--pattern': `url('${assetUrl(color.image || 'hakka_pattern.png')}')` } : { '--color': color.hex }"></i></div><div><b>{{ color.name }}</b><p class="dictionary-pinyin">拼音：{{ color.pinyin }}</p><p>釋義：{{ color.translation }}</p></div></article></div></section></div>
        <footer><button class="secondary" type="button" @click="closeDictionary">關閉詞典</button></footer>
      </article>
    </section>

    <!-- 直式手機專用排行榜彈窗 -->
    <div v-if="lobbyLeaderboardOpen" class="lobby-rank-modal-overlay" role="dialog" aria-modal="true" aria-label="即時排行榜" @click.self="closeLobbyLeaderboard">
      <article ref="lobbyLeaderboardDialogRef" class="lobby-rank-modal" tabindex="-1">
        <header>
          <h2>排行榜</h2>
          <button class="lobby-rank-modal-close" type="button" aria-label="關閉排行榜" @click="closeLobbyLeaderboard">×</button>
        </header>
        <div class="lobby-rank-modal-content">
          <div class="lobby-rank-modal-summary">
            <p>您目前的排名：<b>{{ leaderboard?.myEntry?.rank ?? '--' }}</b></p>
            <p>最佳紀錄：<b>{{ leaderboard?.myEntry ? formatTime(leaderboard.myEntry.elapsedMs) : '--' }}</b></p>
          </div>
          <ol class="lobby-rank-modal-list">
            <li v-for="entry in lobbyRankEntries" :key="`${entry.rank}-${entry.displayName}`">
              <span class="lobby-rank-modal-place" tabindex="0" :aria-label="`第 ${entry.rank} 名，${entry.displayName}，計時 ${formatRankTime(entry.elapsedMs)}，分數 ${entry.score}`">
                <img v-if="entry.rank <= 3" :src="publicAssetUrl(`ui/icon_rank${entry.rank}.png`)" :alt="`第 ${entry.rank} 名${entry.rank === 1 ? '金牌' : entry.rank === 2 ? '銀牌' : '銅牌'}`">
                <span v-if="entry.rank <= 3" class="sr-only">第 {{ entry.rank }} 名</span>
                <b v-else>{{ entry.rank }}</b>
              </span>
              <span class="lobby-rank-modal-name">{{ entry.displayName }}</span>
              <time>{{ formatRankTime(entry.elapsedMs) }}</time>
            </li>
          </ol>
          <p class="rank-foot">目前共 <b>{{ leaderboard?.participantCount ?? 0 }}</b> 人參加，共玩 <b>{{ leaderboard?.playCount ?? 0 }}</b> 次</p>
          <aside class="result-ranking-note">
            <b>注意事項</b>
            <ol>
              <li>同分且作答時間相同時，依活動參加先後進行排序。</li>
              <li>本遊戲獎項僅頒發第 1–6 名；第 7–10 名請再接再厲！</li>
            </ol>
          </aside>
        </div>
        <footer>
          <button class="secondary" @click="closeLobbyLeaderboard">關閉彈窗</button>
        </footer>
      </article>
    </div>
  </main>
</template>
























