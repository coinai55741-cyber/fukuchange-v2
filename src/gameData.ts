import quizCsv from '../data/quiz/穿搭小達人 - 出題架構.csv?raw'
import tagsCsv from '../data/quiz/穿搭小達人 - 單字標籤.csv?raw'
import rulesCsv from '../data/quiz/穿搭規則對照表.csv?raw'
import feedbackMessagesCsv from '../data/quiz/feedback_messages.csv?raw'

export type Slot = 'head' | 'neck' | 'body' | 'pants' | 'knee' | 'shoes'
export type ClosetTab = 'tops' | 'bottoms' | 'shoes' | 'accessories'

export type Clothing = {
  id: string
  name: string
  color: string
  colorKey: 'blue' | 'yellow' | 'white' | 'black' | 'orange' | 'purple' | 'red_flower_pattern'
  colorMode: 'fixed' | 'dye'
  slot: Slot
  tab: ClosetTab
  closetImage: string
  wearLayers: string[]
  type: string
  verbs: string[]
  weather: string[]
  occasions: string[]
  blacklist: string[]
}

export type Question = {
  id: string
  stageId?: number
  verb?: string
  context: string
  color: string
  colorPinyin: string
  item: string
  itemPinyin: string
  target: Partial<Record<Slot, string>>
  tags?: string[]
  errorPromptVerb?: string
  errorPromptItem?: string
  errorPromptColor?: string
  requiredSlots?: Slot[]
}

export const tabs: { id: ClosetTab; label: string; icon: string }[] = [
  { id: 'tops', label: '上衣', icon: '👕' },
  { id: 'bottoms', label: '下身', icon: '🩳' },
  { id: 'shoes', label: '鞋子', icon: '👟' },
  { id: 'accessories', label: '配件', icon: '🧢' },
]

type CsvRow = Record<string, string>

function parseCsv(raw: string): CsvRow[] {
  const rows: string[][] = [[]]
  let value = ''
  let quoted = false
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index]
    if (char === '"') {
      if (quoted && raw[index + 1] === '"') { value += '"'; index += 1 } else quoted = !quoted
    } else if (char === ',' && !quoted) {
      rows[rows.length - 1]?.push(value); value = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && raw[index + 1] === '\n') index += 1
      rows[rows.length - 1]?.push(value); value = ''
      rows.push([])
    } else value += char
  }
  if (value || rows[rows.length - 1]?.length) rows[rows.length - 1]?.push(value)
  const [header, ...data] = rows
  const cleanHeader = header.map(key => key.trim())
  return data.filter((row) => row.some(Boolean)).map((row) => Object.fromEntries(cleanHeader.map((key, index) => [key, row[index] ?? ''])))
}

// Parse Vocabulary Tags from CSV
const parsedTags = parseCsv(tagsCsv)
const itemDataByName: Record<string, {
  type: string
  verbs: string[]
  weather: string[]
  occasions: string[]
  blacklist: string[]
}> = {}

for (const row of parsedTags) {
  if (row.type === 'color') continue
  const name = row.item_name.trim()
  if (!name) continue
  const allTags = row.tags ? row.tags.split(/[\s,\n\r、，]+/).map(s => s.trim()).filter(Boolean) : []
  const weather = allTags.filter(t => t === '冷' || t === '熱')
  const occasions = allTags.filter(t => t !== '冷' && t !== '熱')
  const blacklist = row.must_not ? row.must_not.split(/[\s,\n\r、，]+/).map(s => s.trim()).filter(Boolean) : []
  const verbs = row.must_verb ? row.must_verb.split(/[\s,\n\r、，]+/).map(s => s.trim()).filter(Boolean).map(v => v === '穿' ? '著' : v) : []
  itemDataByName[name] = {
    type: row.type || 'normal',
    verbs,
    weather,
    occasions,
    blacklist
  }
}

const makeClothing = (
  id: string,
  name: string,
  color: Clothing['color'],
  colorKey: Clothing['colorKey'],
  slot: Slot,
  tab: ClosetTab,
  closetImage: string,
  wearLayers = [closetImage],
  colorMode: Clothing['colorMode'] = 'dye'
): Clothing => {
  const meta = itemDataByName[name] ?? { type: 'normal', verbs: [], weather: [], occasions: [], blacklist: [] }
  return {
    id,
    name,
    color,
    colorKey,
    colorMode,
    slot,
    tab,
    closetImage,
    wearLayers,
    type: meta.type,
    verbs: meta.verbs,
    weather: meta.weather,
    occasions: meta.occasions,
    blacklist: meta.blacklist
  }
}

const baseClothing: Clothing[] = [
  makeClothing('body-blue', '藍衫', '固定藍染', 'blue', 'body', 'tops', 'hakka_shirt_B.png', ['hakka_shirt_B.png'], 'fixed'),
  makeClothing('body-yellow', '短衫', '黃色', 'yellow', 'body', 'tops', 'shirt.png'),
  makeClothing('body-white', '短衫', '白色', 'white', 'body', 'tops', 'shirt.png'),
  makeClothing('body-black', '短衫', '烏色', 'black', 'body', 'tops', 'shirt.png'),
  makeClothing('body-flower', '短衫', '紅色花圖案', 'red_flower_pattern', 'body', 'tops', 'shirt.png'),
  makeClothing('body-puffer-white', '羽絨衫', '白色', 'white', 'body', 'tops', 'puffer_jacket_B.png'),
  makeClothing('body-sweater-white', '膨線衫', '白色', 'white', 'body', 'tops', 'sweater_B.png'),
  makeClothing('body-swimsuit-yellow', '泅水衫', '黃色', 'yellow', 'body', 'tops', 'swimsuit_B.png'),
  makeClothing('pants-black', '長褲', '烏色', 'black', 'pants', 'bottoms', 'long_pants_B.png'),
  makeClothing('pants-long-white', '長褲', '白色', 'white', 'pants', 'bottoms', 'long_pants_B.png'),
  makeClothing('pants-yellow', '短褲', '黃色', 'yellow', 'pants', 'bottoms', 'shorts_B.png'),
  makeClothing('pants-shorts-white', '短褲', '白色', 'white', 'pants', 'bottoms', 'shorts_B.png'),
  makeClothing('pants-white', '裙', '白色', 'white', 'pants', 'bottoms', 'skirt_B_over.png'),
  makeClothing('pants-flower', '短褲', '紅色花圖案', 'red_flower_pattern', 'pants', 'bottoms', 'shorts_B.png'),
  makeClothing('shoes-white', '鞋', '白色', 'white', 'shoes', 'shoes', 'sneakers_B.png'),
  makeClothing('shoes-black', '鞋', '烏色', 'black', 'shoes', 'shoes', 'sneakers_B.png'),
  makeClothing('shoes-rain', '水靴筒', '黃色', 'yellow', 'shoes', 'shoes', 'rain_boots_B.png'),
  makeClothing('head-yellow', '帽仔', '黃色', 'yellow', 'head', 'accessories', 'hat.png'),
  makeClothing('head-black', '帽仔', '烏色', 'black', 'head', 'accessories', 'hat.png'),
  makeClothing('head-swim-cap-yellow', '泅水帽', '黃色', 'yellow', 'head', 'accessories', 'head-swin.png'),
  makeClothing('neck-white', '頸圍仔', '白色', 'white', 'neck', 'accessories', 'scarf_B.png'),
  makeClothing('knee-yellow', '膝頭落仔', '黃色', 'yellow', 'knee', 'accessories', 'knee_protector_B.png'),
  makeClothing('pants-shorts-black', '短褲', '烏色', 'black', 'pants', 'bottoms', 'shorts_B.png'),
  makeClothing('head-white', '帽仔', '白色', 'white', 'head', 'accessories', 'hat.png'),
  makeClothing('pants-long-yellow', '長褲', '黃色', 'yellow', 'pants', 'bottoms', 'long_pants_B.png'),
  makeClothing('body-puffer-black', '羽絨衫', '烏色', 'black', 'body', 'tops', 'puffer_jacket_B.png'),
]

const dyeColors: { name: string; key: Clothing['colorKey'] }[] = [
  { name: '柑仔色', key: 'orange' },
  { name: '吊菜色', key: 'purple' },
  { name: '紅色花圖案', key: 'red_flower_pattern' },
]

function makeDyeVariants(prefix: string, name: string, slot: Slot, tab: ClosetTab, image: string, colors = dyeColors) {
  return colors.map((color) => makeClothing(`${prefix}-${color.key}`, name, color.name, color.key, slot, tab, image))
}

const seenDyes = new Set<string>()
export const clothing: Clothing[] = [
  ...baseClothing,
  ...makeDyeVariants('short-shirt', '短衫', 'body', 'tops', 'shirt.png'),
  ...makeDyeVariants('puffer-jacket', '羽絨衫', 'body', 'tops', 'puffer_jacket_B.png'),
  ...makeDyeVariants('sweater', '膨線衫', 'body', 'tops', 'sweater_B.png'),
  ...makeDyeVariants('swimsuit', '泅水衫', 'body', 'tops', 'swimsuit_B.png', dyeColors.filter((color) => color.key !== 'red_flower_pattern')),
  ...makeDyeVariants('long-pants', '長褲', 'pants', 'bottoms', 'long_pants_B.png'),
  ...makeDyeVariants('shorts', '短褲', 'pants', 'bottoms', 'shorts_B.png'),
  ...makeDyeVariants('skirt', '裙', 'pants', 'bottoms', 'skirt_B_over.png'),
  ...makeDyeVariants('sneakers', '鞋', 'shoes', 'shoes', 'sneakers_B.png'),
  ...makeDyeVariants('rain-boots', '水靴筒', 'shoes', 'shoes', 'rain_boots_B.png'),
  ...makeDyeVariants('hat', '帽仔', 'head', 'accessories', 'hat.png'),
  ...makeDyeVariants('scarf', '頸圍仔', 'neck', 'accessories', 'scarf_B.png'),
  ...makeDyeVariants('knee-protector', '膝頭落仔', 'knee', 'accessories', 'knee_protector_B.png'),
  ...makeDyeVariants('swim-cap', '泅水帽', 'head', 'accessories', 'head-swin.png', dyeColors.filter((color) => color.key !== 'red_flower_pattern')),
].filter((item) => {
  const key = `${item.name}-${item.color}`
  if (seenDyes.has(key)) {
    return false
  }
  seenDyes.add(key)
  return true
})

const targetItemIds: Record<string, string> = {
  'hakka_shirt@none': 'body-blue', 'short_shirt@yellow': 'body-yellow', 'short_shirt@white': 'body-white', 'short_shirt@black': 'body-black',
  'shorts@yellow': 'pants-yellow', 'shorts@white': 'pants-shorts-white', 'shorts@black': 'pants-shorts-black',
  'long_pants@black': 'pants-black', 'long_pants@white': 'pants-long-white', 'long_pants@yellow': 'pants-long-yellow', 'skirt@white': 'pants-white',
  'shoes@white': 'shoes-white', 'shoes@black': 'shoes-black', 'rain_boots@yellow': 'shoes-rain',
  'hat@yellow': 'head-yellow', 'hat@black': 'head-black', 'hat@white': 'head-white', 'swim_cap@yellow': 'head-swim-cap-yellow', 'swimsuit@yellow': 'body-swimsuit-yellow',
  'puffer_jacket@white': 'body-puffer-white', 'puffer_jacket@black': 'body-puffer-black', 'knee_protector@yellow': 'knee-yellow', 'scarf@white': 'neck-white',
}

const slotByEntity: Record<string, Slot> = {
  hakka_shirt: 'body', short_shirt: 'body', puffer_jacket: 'body', sweater: 'body', swimsuit: 'body',
  shorts: 'pants', long_pants: 'pants', skirt: 'pants', shoes: 'shoes', rain_boots: 'shoes',
  hat: 'head', swim_cap: 'head', scarf: 'neck', knee_protector: 'knee',
}

const displayEntityByChinese: Record<string, string> = {
  '藍衫': 'hakka_shirt', '短衫': 'short_shirt', '短褲': 'shorts', '長褲': 'long_pants', '裙': 'skirt', '鞋': 'shoes', '水靴筒': 'rain_boots',
  '帽仔': 'hat', '泅水帽': 'swim_cap', '頸圍仔': 'scarf', '膝頭落仔': 'knee_protector', '泅水衫': 'swimsuit',
  '羽絨衫': 'puffer_jacket', '膨線衫': 'sweater'
}

const colorLabels: Record<string, string> = { 
  yellow: '黃色', white: '白色', black: '烏色', blue: '藍色', none: '',
  orange: '柑仔色', purple: '吊菜色', red_flower_pattern: '紅色花圖案'
}
const pinyinByWord: Record<string, string> = { 
  '藍衫': 'lamˋ samˊ', '短衫': 'donˋ qiu', '短褲': 'donˋ  fu', '長褲': 'congˇ fu', '鞋': 'haiˇ', 
  '水靴筒': 'suiˋ hioˊ thungˇ', '帽仔': 'mo eˋ', '頸圍仔': 'giangˋ viˇ eˋ', '膝頭落仔': 'qidˋ teuˇ labˋ eˋ', 
  '黃色': 'vongˇ sedˋ', '白色': 'pag sedˋ', '烏色': 'vuˊ sedˋ', '藍色': 'lamˇ sedˋ',
  '柑仔色': 'gamˊ eˋ sedˋ', '吊菜色': 'diau coi sedˋ', '紅色花圖案': 'fungˇ sedˋ faˊ bu',
  '羽絨衫': 'iˋ iungˇ samˊ', '膨線衫': 'pong xien samˊ', '泅水帽': 'qiuˇ suiˋ moapˋ', '泅水衫': 'siuˊ suiˋ samˊ'
}

function findClothingId(entity: string, colorKey: string): string | undefined {
  const key = `${entity}@${colorKey}`
  if (targetItemIds[key]) return targetItemIds[key]

  const entityToNameMap: Record<string, string> = {
    hakka_shirt: '藍衫', short_shirt: '短衫', shorts: '短褲', long_pants: '長褲', skirt: '裙',
    puffer_jacket: '羽絨衫', sweater: '膨線衫', swimsuit: '泅水衫', scarf: '頸圍仔', hat: '帽仔',
    shoes: '鞋', knee_protector: '膝頭落仔', rain_boots: '水靴筒', swim_cap: '泅水帽'
  }
  const name = entityToNameMap[entity]
  if (!name) return undefined

  let searchColorKey = colorKey
  if (colorKey === 'dark_green') searchColorKey = 'purple'

  const found = clothing.find(c => c.name === name && c.colorKey === searchColorKey)
  return found?.id
}

function buildQuestionsFromCsv(): Question[] {
  return parseCsv(quizCsv).flatMap((row) => {
    const target: Partial<Record<Slot, string>> = {}
    let valid = true
    const targetTokens = row.target_outfit_ids.split(';').filter(Boolean)
    for (const token of targetTokens) {
      const [, entityAndColor = ''] = token.split(':')
      const [entity, colorKey] = entityAndColor.split('@')
      const slot = slotByEntity[entity]
      const itemId = findClothingId(entity, colorKey)
      if (!slot || !itemId) { valid = false; break }
      target[slot] = itemId
    }
    if (!valid || !Object.keys(target).length) return []

    const item = row.item.split(',')[0].trim()
    const promptEntity = displayEntityByChinese[item]
    const promptToken = targetTokens.map((token) => token.split(':')[1]).find((token) => token?.startsWith(`${promptEntity}@`))
    const promptColor = promptToken?.split('@')[1] ?? ''
    const color = item === '藍衫' ? '' : (colorLabels[promptColor] ?? '')

    const csvSlots = row.required_slots ? row.required_slots.split(',').map(s => s.trim()).filter(Boolean) : ['clothes', 'pants', 'shoes']
    const requiredSlots = csvSlots.map(s => {
      if (s === 'clothes') return 'body'
      if (s === 'accessories') return 'neck'
      return s as Slot
    })

    return [{
      id: `csv-${row.stage_id}`,
      stageId: Number(row.stage_id),
      verb: row.stage_title.split(',')[0].trim(),
      context: row.context_text,
      color,
      colorPinyin: pinyinByWord[color] ?? color,
      item,
      itemPinyin: pinyinByWord[item] ?? item,
      target,
      tags: row.must_have.split(',').map((tag) => tag.trim()).filter(Boolean),
      errorPromptVerb: row['錯誤提示 1：動詞'] || '',
      errorPromptItem: row['錯誤提示 2：衣物'] || '',
      errorPromptColor: row['錯誤提示 3：顏色'] || '',
      requiredSlots
    }]
  })
}

export const questions: Question[] = buildQuestionsFromCsv()

export interface RuleData {
  type: string
  name: string
  slot: string
  verb: string
  tags: string[]
  blacklist: string[]
  warning: string
}

function buildRulesFromCsv(): RuleData[] {
  return parseCsv(rulesCsv).map((row) => {
    const type = row['規則類型'] || ''
    const name = row['名稱/觸發條件'] || ''
    const slot = row['部位/英文'] || ''
    const verb = row['適用動詞/搭配'] || ''
    const tags = row['適合場合/天氣'] ? row['適合場合/天氣'].split(',').map(t => t.trim()).filter(Boolean) : []
    const blacklist = row['禁用場合/黑名單'] ? row['禁用場合/黑名單'].split(',').map(t => t.trim()).filter(Boolean) : []
    const warning = row['警告提示與評語文案'] || ''

    return { type, name, slot, verb, tags, blacklist, warning }
  })
}

export const rulesConfig = buildRulesFromCsv()

export const feedbackMessages: Record<string, string> = Object.fromEntries(
  parseCsv(feedbackMessagesCsv)
    .map((row) => [row.key?.trim(), row.message ?? ''])
    .filter(([key, message]) => key && message)
)
