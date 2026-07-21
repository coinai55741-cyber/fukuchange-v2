<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { clothing, questions, tabs, type ClosetTab, type Clothing, type Question, type Slot } from './gameData'
import { leaderboardService, type LeaderboardResponse } from './leaderboardService'
import { dictionaryColors, dictionaryItems } from './dictionaryData'
import SpineAvatar from './SpineAvatar.vue'

type Screen = 'intro' | 'lobby' | 'game' | 'result'
type Feedback = { kind: 'success' | 'error'; text: string } | null
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
const requiredSlots = computed(() => Object.keys(currentQuestion.value?.target ?? []) as Slot[])
const completedForQuestion = computed(() => requiredSlots.value.filter((slot) => selected.value[slot]).length)
const filteredDictionaryItems = computed(() => {
  const query = dictionarySearch.value.trim().toLowerCase()
  if (!query) return dictionaryItems
  return dictionaryItems.filter((item) => `${item.name} ${item.pinyin} ${item.translation} ${item.description}`.toLowerCase().includes(query))
})

const questionText = computed(() => {
  const question = currentQuestion.value
  if (!question) return ''
  const color = isPinyinQuestion.value && pinyinField.value === 'color' ? question.colorPinyin : question.color
  const item = isPinyinQuestion.value && pinyinField.value === 'item' ? question.itemPinyin : question.item
  const phrase = color ? `${color} 个 ${item}` : item
  return `${question.verb ?? '著'} ${phrase}${question.context}`
})

const seasonWeatherLabel = computed(() => {
  const id = currentQuestion.value?.id
  const labels: Record<string, string> = {
    q01: '☀️ 夏天／熱', q02: '☀️ 夏天／熱', q03: '☀️ 夏天／熱', q04: '☀️ 夏天／熱（晚上）', q05: '☀️ 夏天／熱・下雨',
    q06: '☀️ 夏天／熱', q07: '❄️ 冬天／冷', q08: '☀️ 夏天／熱', q09: '❄️ 冬天／冷・下雨', q10: '❄️ 冬天／冷',
    q11: '☀️ 夏天／熱', q12: '☀️ 夏天／熱・下雨', q13: '❄️ 冬天／冷', q14: '☀️ 夏天／熱', q15: '❄️ 冬天／冷・下雨',
    q16: '☀️ 夏天／熱', q17: '❄️ 冬天／冷', q18: '☀️ 夏天／熱', q19: '❄️ 冬天／冷', q20: '❄️ 冬天／冷',
  }
  return id ? labels[id] ?? '☀️ 夏天／熱' : ''
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
  red_flower_pattern: '#dc2626',
}

function assetUrl(file: string) {
  return `/images/${file}`
}

function garmentStyle(item: Clothing, layer = item.wearLayers[0]) {
  return {
    '--garment-color': colorMap[item.colorKey],
    '--garment-mask': `url("${assetUrl(layer)}")`,
    '--garment-pattern': item.colorKey === 'red_flower_pattern' ? `url("${assetUrl('red_flower_pattern.svg')}")` : 'none',
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

function startGame() {
  const nextGameSet = shuffle(questions).slice(0, 10)
  gameSet.value = nextGameSet
  questionIndex.value = 0
  selected.value = {}
  prepareCloset(nextGameSet[0])
  score.value = 0
  completed.value = 0
  elapsedMs.value = 0
  feedback.value = null
  screen.value = 'game'
  window.clearInterval(timer)
  const startedAt = Date.now()
  timer = window.setInterval(() => { elapsedMs.value = Date.now() - startedAt }, 50)
}

function chooseCard(id: string, slot: Slot) {
  selected.value = { ...selected.value, [slot]: id }
  feedback.value = null
}

function focusClosetSlot(tab: ClosetTab) {
  activeTab.value = tab
}

function clearSlot(slot: Slot) {
  if (!selected.value[slot]) return
  const next = { ...selected.value }
  delete next[slot]
  selected.value = next
  feedback.value = null
}

function resetOutfit() {
  selected.value = {}
  feedback.value = null
}

function submitOutfit() {
  const exact = requiredSlots.value.every((slot) => selected.value[slot] === currentQuestion.value.target[slot])
  if (!exact) {
    feedback.value = { kind: 'error', text: '還沒穿好，再試著搭配看看！請確認必要服裝與顏色。' }
    return
  }
  score.value += 10
  completed.value += 1
  feedback.value = { kind: 'success', text: '真會著衫！這一題獲得 10 分。' }
}

function advanceQuestion(skipped = false) {
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
  leaderboard.value = await leaderboardService.getLeaderboard(9)
  screen.value = 'result'
}

function replay() {
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
      <div class="placeholder-label">{{ introScenes[introStep].tag }}</div>
      <div class="story-character" :class="introScenes[introStep].mood"><span>阿梅</span></div>
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

    <section v-else-if="screen === 'game'" class="game-screen">
      <header class="toolbar"><button class="icon-button" @click="screen = 'lobby'">⌂</button><span>？</span><span>♫ 音效</span><strong>⏱ {{ formatTime(elapsedMs) }}</strong></header>
      <aside class="mission-card"><span class="progress">第 {{ questionIndex + 1 }}/10 題・第 {{ phase }} 階段</span><h2>{{ seasonWeatherLabel }}</h2><p>{{ questionText }}</p><div class="scene-placeholder">任務場景假圖</div></aside>
      <section class="avatar-zone"><nav class="body-controls" aria-label="部位衣櫃捷徑"><div v-for="control in bodySlotControls" :key="control.slot" class="body-control"><button type="button" :class="{ equipped: Boolean(selected[control.slot]) }" @click="focusClosetSlot(control.tab)">{{ control.label }}</button><button v-if="selected[control.slot]" type="button" class="slot-clear" :aria-label="`取消${control.label}部位衣物`" @click="clearSlot(control.slot)">×</button></div></nav><SpineAvatar :outfit="selected" /></section>
      <aside class="closet-card"><nav><button v-for="tab in tabs" :key="tab.id" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id"><b>{{ tab.icon }}</b>{{ tab.label }}</button></nav><div class="clothing-grid"><button v-for="card in closetCards" :key="card.id" class="clothing-card" :class="{ selected: selected[card.slot] === card.id }" :aria-label="`${card.color} ${card.name}`" @click="chooseCard(card.id, card.slot)"><img class="clothing-card-image" :src="assetUrl(card.closetImage)" alt=""></button></div><div class="closet-footer"><strong>完成搭配 {{ completedForQuestion }}/{{ requiredSlots.length }}</strong><button class="primary" @click="submitOutfit">送出搭配</button><button class="secondary" @click="resetOutfit">重置服裝</button><button class="secondary" @click="advanceQuestion(true)">跳過這題</button></div></aside>
      <div v-if="feedback" class="feedback" :class="feedback.kind"><p>{{ feedback.text }}</p><button v-if="feedback.kind === 'success'" class="primary" @click="advanceQuestion()">{{ questionIndex === 9 ? '查看成績' : '下一題' }}</button></div>
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
