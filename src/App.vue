<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { clothing, questions, tabs, type ClosetTab, type Clothing, type Question, type Slot } from './gameData'
import { leaderboardService, type LeaderboardResponse } from './leaderboardService'

type Screen = 'intro' | 'lobby' | 'game' | 'result'
type Feedback = { kind: 'success' | 'error'; text: string } | null

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
let timer: number | undefined

const introScenes = [
  { tag: '假圖：intro_01_ready', speaker: '阿梅', text: '哇！我已經準備好出發囉！', mood: 'happy' },
  { tag: '假圖：intro_02_mom_warning', speaker: '媽媽', text: '阿梅！等一下，你確定要穿這樣出門嗎？看準天氣和場合，穿得舒服又體面，才不會變成災難焦點喔！', mood: 'surprised' },
  { tag: '假圖：intro_03_wrong_examples', speaker: '阿梅', text: '哎呀！如果穿錯衣服或選錯顏色，可就太尷尬了！造型師快來幫幫忙吧！', mood: 'worried' },
]

const currentQuestion = computed(() => gameSet.value[questionIndex.value])
const phase = computed(() => questionIndex.value < 5 ? 1 : 2)
const isPinyinQuestion = computed(() => phase.value === 2)
const targetIds = computed(() => Object.values(currentQuestion.value?.target ?? {}))
const requiredSlots = computed(() => Object.keys(currentQuestion.value?.target ?? []) as Slot[])
const completedForQuestion = computed(() => requiredSlots.value.filter((slot) => selected.value[slot]).length)

const questionText = computed(() => {
  const question = currentQuestion.value
  if (!question) return ''
  const color = isPinyinQuestion.value && pinyinField.value === 'color' ? question.colorPinyin : question.color
  const item = isPinyinQuestion.value && pinyinField.value === 'item' ? question.itemPinyin : question.item
  return `著 ${color} 个 ${item}，${question.context}`
})

const seasonWeatherLabel = computed(() => {
  const id = currentQuestion.value?.id
  const labels: Record<string, string> = {
    q01: '春天・晴天', q02: '夏天・晴天', q03: '春天・晴天', q04: '夏天・夜晚', q05: '春天・下雨',
    q06: '夏天・晴天', q07: '秋天・涼爽', q08: '夏天・晴天', q09: '春天・晴天', q10: '秋天・夜晚',
    q11: '春天・晴天', q12: '夏天・晴天', q13: '春天・晴天', q14: '夏天・夜晚', q15: '春天・下雨',
    q16: '夏天・晴天', q17: '秋天・涼爽', q18: '夏天・晴天', q19: '春天・晴天', q20: '冬天・寒冷',
  }
  return id ? labels[id] ?? '一般・晴天' : ''
})

const closetCards = computed(() => {
  const targets = targetIds.value
  return clothing.filter((item) => item.tab === activeTab.value && (targets.includes(item.id) || true))
})

const wornItems = computed(() => Object.entries(selected.value)
  .map(([, id]) => clothing.find((item) => item.id === id))
  .filter(Boolean))

// 平時接一般頭部；頭部插槽有帽類裝備時改用收髮版本，再疊加帽子圖層。
const activeHeadAsset = computed(() => selected.value.head ? 'head-swinA.png' : 'head-normal.png')

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
  gameSet.value = shuffle(questions).slice(0, 10)
  questionIndex.value = 0
  selected.value = {}
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
  questionIndex.value += 1
  selected.value = {}
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
      <div class="lobby-card">
        <p class="eyebrow">穿搭小達人</p><h1>幫阿梅看場合穿衣服！</h1>
        <p>每局隨機抽取 10 題；前 5 題為中文情境題，後 5 題將顏色或衣物其中一項改成四縣腔拼音。</p>
        <div class="dialects"><button class="selected">四縣腔</button><button disabled>海陸腔（準備中）</button><button disabled>大埔腔（準備中）</button><button disabled>饒平腔（準備中）</button></div>
        <button class="primary start" @click="startGame">開始遊戲</button>
        <button class="text-button rank-link" @click="showLeaderboard">查看排行榜</button>
      </div>
    </section>

    <section v-else-if="screen === 'game'" class="game-screen">
      <header class="toolbar"><button class="icon-button" @click="screen = 'lobby'">⌂</button><span>？</span><span>♫ 音效</span><strong>⏱ {{ formatTime(elapsedMs) }}</strong></header>
      <aside class="mission-card"><span class="progress">第 {{ questionIndex + 1 }}/10 題・第 {{ phase }} 階段</span><h2>季節：{{ seasonWeatherLabel.split('・')[0] }}　天氣：{{ seasonWeatherLabel.split('・')[1] }}</h2><p>{{ questionText }}</p><div class="scene-placeholder">任務場景假圖</div></aside>
      <section class="avatar-zone"><div class="body-controls" aria-hidden="true">頭<br>頸<br>身<br>褲<br>膝<br>腳</div><div class="avatar"><img class="base-body" :src="assetUrl('body.png')" alt="阿梅角色底圖"><img class="base-head" :src="assetUrl(activeHeadAsset)" alt="阿梅頭部"><template v-for="item in wornItems" :key="item!.id"><div v-for="layer in item!.wearLayers" :key="layer" class="garment-layer" :class="`layer-${item!.slot}`" :style="garmentStyle(item!, layer)"><span class="garment-fill"></span><img class="garment-outline" :src="assetUrl(layer)" alt=""></div></template></div></section>
      <aside class="closet-card"><nav><button v-for="tab in tabs" :key="tab.id" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id"><b>{{ tab.icon }}</b>{{ tab.label }}</button></nav><div class="clothing-grid"><button v-for="card in closetCards" :key="card.id" class="clothing-card" :class="{ selected: selected[card.slot] === card.id }" @click="chooseCard(card.id, card.slot)"><span class="clothing-icon" :style="garmentStyle(card, card.closetImage)"><span></span></span><small>{{ card.color }} {{ card.name }}</small></button></div><div class="closet-footer"><strong>完成搭配 {{ completedForQuestion }}/{{ requiredSlots.length }}</strong><button class="primary" @click="submitOutfit">送出搭配</button><button class="secondary" @click="resetOutfit">重置服裝</button><button class="secondary" @click="advanceQuestion(true)">跳過這題</button></div></aside>
      <div v-if="feedback" class="feedback" :class="feedback.kind"><p>{{ feedback.text }}</p><button v-if="feedback.kind === 'success'" class="primary" @click="advanceQuestion()">{{ questionIndex === 9 ? '查看成績' : '下一題' }}</button></div>
    </section>

    <section v-else class="result-screen">
      <div class="result-card"><p class="eyebrow">成績結算</p><h1>{{ score === 100 ? '完美穿搭師' : score >= 60 ? '時尚觀察員' : '穿搭初學者' }}</h1><p>總分 {{ score }} 分　・　花費時間 {{ formatTime(elapsedMs) }}</p><p class="result-comment">{{ score === 100 ? '無懈可擊！你的搭配精準符合所有環境限制。' : '多觀察天氣與場合，再試一次一定會更好！' }}</p><button class="primary" @click="replay">重玩一次</button></div>
      <section class="ranking-card"><h2>排行榜 <small>Mock 資料</small></h2><div class="rank-head"><span>排名</span><span>學員</span><span>分數</span><span>計時</span></div><div v-for="entry in leaderboard?.entries" :key="`${entry.rank}-${entry.displayName}`" class="rank-row" :class="{ mine: entry.displayName === '測○○' }"><span>{{ entry.rank }}</span><span>{{ entry.displayName }}</span><span>{{ entry.score }}</span><span>{{ formatTime(entry.elapsedMs) }}</span></div><p class="rank-foot">目前共 {{ leaderboard?.participantCount ?? 0 }} 人參加，共玩 {{ leaderboard?.playCount ?? 0 }} 次</p></section>
    </section>
  </main>
</template>
