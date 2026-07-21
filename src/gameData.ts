import quizCsv from '../data/quiz/穿搭小達人 - 出題架構.csv?raw'

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
}

export const tabs: { id: ClosetTab; label: string; icon: string }[] = [
  { id: 'tops', label: '上衣', icon: '👕' },
  { id: 'bottoms', label: '下身', icon: '🩳' },
  { id: 'shoes', label: '鞋子', icon: '👟' },
  { id: 'accessories', label: '配件', icon: '🧢' },
]

const makeClothing = (id: string, name: string, color: Clothing['color'], colorKey: Clothing['colorKey'], slot: Slot, tab: ClosetTab, closetImage: string, wearLayers = [closetImage], colorMode: Clothing['colorMode'] = 'dye'): Clothing => ({ id, name, color, colorKey, colorMode, slot, tab, closetImage, wearLayers })

const baseClothing: Clothing[] = [
  makeClothing('body-blue', '藍衫', '固定藍染', 'blue', 'body', 'tops', 'hakka_shirt_B.png', ['hakka_shirt_B.png'], 'fixed'),
  makeClothing('body-yellow', '短衫', '黃色', 'yellow', 'body', 'tops', 'shirt.png'),
  makeClothing('body-white', '短衫', '白色', 'white', 'body', 'tops', 'shirt.png'),
  makeClothing('body-black', '短衫', '烏色', 'black', 'body', 'tops', 'shirt.png'),
  // 紅色花圖案只提供給允許的日常衣物；藍衫與泅水衫不可生成此配色。
  makeClothing('body-flower', '短衫', '紅色花圖案', 'red_flower_pattern', 'body', 'tops', 'shirt.png'),
  makeClothing('body-puffer-white', '羽絨衫', '白色', 'white', 'body', 'tops', 'puffer_jacket_B.png'),
  makeClothing('body-sweater-white', '膨線衫', '白色', 'white', 'body', 'tops', 'sweater_B.png'),
  makeClothing('body-swimsuit-yellow', '泅水衫', '黃色', 'yellow', 'body', 'tops', 'swimsuit_B.png'),
  makeClothing('pants-black', '長褲', '烏色', 'black', 'pants', 'bottoms', 'long_pants_B.png'),
  makeClothing('pants-long-white', '長褲', '白色', 'white', 'pants', 'bottoms', 'long_pants_B.png'),
  makeClothing('pants-yellow', '短褲', '黃色', 'yellow', 'pants', 'bottoms', 'shorts_B.png'),
  makeClothing('pants-shorts-white', '短褲', '白色', 'white', 'pants', 'bottoms', 'shorts_B.png'),
  makeClothing('pants-white', '裙', '白色', 'white', 'pants', 'bottoms', 'skirt_B_over.png'),
  makeClothing('pants-blue', '長褲', '藍色', 'blue', 'pants', 'bottoms', 'long_pants_B.png'),
  makeClothing('pants-flower', '短褲', '紅色花圖案', 'red_flower_pattern', 'pants', 'bottoms', 'shorts_B.png'),
  makeClothing('shoes-white', '鞋', '白色', 'white', 'shoes', 'shoes', 'sneakers_B.png'),
  makeClothing('shoes-black', '鞋', '烏色', 'black', 'shoes', 'shoes', 'sneakers_B.png'),
  makeClothing('shoes-rain', '水靴筒', '黃色', 'yellow', 'shoes', 'shoes', 'rain_boots_B.png'),
  makeClothing('head-yellow', '帽仔', '黃色', 'yellow', 'head', 'accessories', 'hat.png'),
  makeClothing('head-black', '帽仔', '烏色', 'black', 'head', 'accessories', 'hat.png'),
  // 泳帽在角色端會同時啟用替換頭部與帽體；衣櫃使用 A 圖。
  makeClothing('head-swim-cap', '泳帽', '藍色', 'blue', 'head', 'accessories', 'head-swin.png'),
  // 舊題庫仍會指定這個黃色泳帽；必須和新版 swim-cap-* 一樣走可染色的帽體 slot。
  makeClothing('head-swim-cap-yellow', '泅水帽', '黃色', 'yellow', 'head', 'accessories', 'head-swin.png'),
  makeClothing('neck-white', '頸圍仔', '白色', 'white', 'neck', 'accessories', 'scarf_B.png'),
  makeClothing('knee-yellow', '膝頭落仔', '黃色', 'yellow', 'knee', 'accessories', 'knee_protector_B.png'),
]

const dyeColors: { name: string; key: Clothing['colorKey'] }[] = [
  { name: '柑仔色', key: 'orange' },
  { name: '吊菜色', key: 'purple' },
  { name: '紅色花圖案', key: 'red_flower_pattern' },
]

function makeDyeVariants(prefix: string, name: string, slot: Slot, tab: ClosetTab, image: string, colors = dyeColors) {
  return colors.map((color) => makeClothing(`${prefix}-${color.key}`, name, color.name, color.key, slot, tab, image))
}

// 現有 B 圖同時作為衣櫃圖；所有可染服裝都有橘、暗紫與花布版本。
// 藍衫固定藍染，泅水衫／泅水帽依規則不產生紅色花圖案。
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
]

const threePiece = (body: string, pants: string, shoes: string, extras: Partial<Record<Slot, string>> = {}) => ({ body, pants, shoes, ...extras })

const legacyQuestions: Question[] = [
  { id: 'q01', context: '去客庄體驗藍染，像是穿越到早時客庄。', color: '藍色', colorPinyin: 'lamˋ seˋ', item: '藍衫', itemPinyin: 'lamˋ samˊ', target: threePiece('body-blue', 'pants-black', 'shoes-white') },
  { id: 'q02', context: '大熱天到公園打球，要輕鬆又舒服。', color: '黃色', colorPinyin: 'vongˋ sedˋ', item: '短衫', itemPinyin: 'donˊ fuˋ', target: threePiece('body-yellow', 'pants-yellow', 'shoes-white') },
  { id: 'q03', context: '要去參加正式的家庭聚會。', color: '白色', colorPinyin: 'pagˋ sedˋ', item: '短衫', itemPinyin: 'donˊ fuˋ', target: threePiece('body-white', 'pants-white', 'shoes-white') },
  { id: 'q04', context: '晚上看螢火蟲，衣服要低調一些。', color: '烏色', colorPinyin: 'vuˊ sedˋ', item: '長褲', itemPinyin: 'chhongˇ fuˋ', target: threePiece('body-black', 'pants-black', 'shoes-black') },
  { id: 'q05', context: '下雨天出門，腳不要弄濕。', color: '黃色', colorPinyin: 'vongˋ sedˋ', item: '水靴筒', itemPinyin: 'suiˋ hiˋ thungˇ', target: threePiece('body-yellow', 'pants-black', 'shoes-rain') },
  { id: 'q06', context: '晴天野餐，要記得保護頭部。', color: '黃色', colorPinyin: 'vongˋ sedˋ', item: '帽仔', itemPinyin: 'moˊ eˋ', target: threePiece('body-yellow', 'pants-yellow', 'shoes-white', { head: 'head-yellow' }) },
  { id: 'q07', context: '天氣轉涼，到戶外散步。', color: '白色', colorPinyin: 'pagˋ sedˋ', item: '頸圍仔', itemPinyin: 'giˋ teuˋ eˋ', target: threePiece('body-white', 'pants-black', 'shoes-black', { neck: 'neck-white' }) },
  { id: 'q08', context: '戶外活動時，膝蓋也要做好保護。', color: '黃色', colorPinyin: 'vongˋ sedˋ', item: '膝頭落仔', itemPinyin: 'kiˊ teuˇ logˋ eˋ', target: threePiece('body-yellow', 'pants-yellow', 'shoes-white', { knee: 'knee-yellow' }) },
  { id: 'q09', context: '參加校園活動，穿得俐落好活動。', color: '藍色', colorPinyin: 'lamˋ seˋ', item: '長褲', itemPinyin: 'chhongˇ fuˋ', target: threePiece('body-blue', 'pants-blue', 'shoes-white') },
  { id: 'q10', context: '傍晚外出，穿上穩重的搭配。', color: '烏色', colorPinyin: 'vuˊ sedˋ', item: '短衫', itemPinyin: 'donˊ fuˋ', target: threePiece('body-black', 'pants-black', 'shoes-black', { head: 'head-black' }) },
  { id: 'q11', context: '要做藍染手作，選擇文化感的服裝。', color: '藍色', colorPinyin: 'lamˋ seˋ', item: '藍衫', itemPinyin: 'lamˋ samˊ', target: threePiece('body-blue', 'pants-blue', 'shoes-white') },
  { id: 'q12', context: '學校戶外課程，要穿得方便行走。', color: '黃色', colorPinyin: 'vongˋ sedˋ', item: '短褲', itemPinyin: 'fonˊ kuˋ', target: threePiece('body-yellow', 'pants-yellow', 'shoes-white') },
  { id: 'q13', context: '參加春天的家庭聚餐。', color: '白色', colorPinyin: 'pagˋ sedˋ', item: '裙', itemPinyin: 'kunˊ', target: threePiece('body-white', 'pants-white', 'shoes-white') },
  { id: 'q14', context: '傍晚的戶外觀察活動，避免太醒目。', color: '烏色', colorPinyin: 'vuˊ sedˋ', item: '鞋', itemPinyin: 'haiˇ', target: threePiece('body-black', 'pants-black', 'shoes-black') },
  { id: 'q15', context: '雨後要去買東西，地面還濕濕的。', color: '黃色', colorPinyin: 'vongˋ sedˋ', item: '水靴筒', itemPinyin: 'suiˋ hiˋ thungˇ', target: threePiece('body-yellow', 'pants-black', 'shoes-rain') },
  { id: 'q16', context: '夏日出遊，戴帽子遮陽。', color: '黃色', colorPinyin: 'vongˋ sedˋ', item: '帽仔', itemPinyin: 'moˊ eˋ', target: threePiece('body-yellow', 'pants-yellow', 'shoes-white', { head: 'head-yellow' }) },
  { id: 'q17', context: '秋天校外教學，頸部也要保暖。', color: '白色', colorPinyin: 'pagˋ sedˋ', item: '頸圍仔', itemPinyin: 'giˋ teuˋ eˋ', target: threePiece('body-white', 'pants-black', 'shoes-black', { neck: 'neck-white' }) },
  { id: 'q18', context: '跑跳活動前，幫膝蓋多一層保護。', color: '黃色', colorPinyin: 'vongˋ sedˋ', item: '膝頭落仔', itemPinyin: 'kiˊ teuˇ logˋ eˋ', target: threePiece('body-yellow', 'pants-yellow', 'shoes-white', { knee: 'knee-yellow' }) },
  { id: 'q19', context: '客庄散步，選一套簡單的藍色搭配。', color: '藍色', colorPinyin: 'lamˋ seˋ', item: '長褲', itemPinyin: 'chhongˇ fuˋ', target: threePiece('body-blue', 'pants-blue', 'shoes-white') },
  { id: 'q20', context: '晚上外出，選沉穩又方便走路的衣物。', color: '烏色', colorPinyin: 'vuˊ sedˋ', item: '帽仔', itemPinyin: 'moˊ eˋ', target: threePiece('body-black', 'pants-black', 'shoes-black', { head: 'head-black' }) },
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
  return data.filter((row) => row.some(Boolean)).map((row) => Object.fromEntries(header.map((key, index) => [key, row[index] ?? ''])))
}

const targetItemIds: Record<string, string> = {
  'hakka_shirt@none': 'body-blue', 'short_shirt@yellow': 'body-yellow', 'short_shirt@white': 'body-white', 'short_shirt@black': 'body-black',
  'shorts@yellow': 'pants-yellow', 'shorts@white': 'pants-shorts-white', 'long_pants@black': 'pants-black', 'long_pants@white': 'pants-long-white', 'skirt@white': 'pants-white',
  'shoes@white': 'shoes-white', 'shoes@black': 'shoes-black', 'rain_boots@yellow': 'shoes-rain',
  'hat@yellow': 'head-yellow', 'hat@black': 'head-black', 'swim_cap@yellow': 'head-swim-cap-yellow', 'swimsuit@yellow': 'body-swimsuit-yellow',
  'puffer_jacket@white': 'body-puffer-white', 'knee_protector@yellow': 'knee-yellow', 'scarf@white': 'neck-white',
}

const slotByEntity: Record<string, Slot> = {
  hakka_shirt: 'body', short_shirt: 'body', puffer_jacket: 'body', sweater: 'body', swimsuit: 'body',
  shorts: 'pants', long_pants: 'pants', skirt: 'pants', shoes: 'shoes', rain_boots: 'shoes',
  hat: 'head', swim_cap: 'head', scarf: 'neck', knee_protector: 'knee',
}

const displayEntityByChinese: Record<string, string> = {
  '藍衫': 'hakka_shirt', '短衫': 'short_shirt', '短褲': 'shorts', '長褲': 'long_pants', '裙': 'skirt', '鞋': 'shoes', '水靴筒': 'rain_boots',
  '帽仔': 'hat', '泅水帽': 'swim_cap', '頸圍仔': 'scarf', '膝頭落仔': 'knee_protector', '泅水衫': 'swimsuit',
}

const colorLabels: Record<string, string> = { yellow: '黃色', white: '白色', black: '烏色', blue: '藍色', none: '' }
const pinyinByWord: Record<string, string> = { '藍衫': 'lamˋ samˊ', '短衫': 'donˊ fuˋ', '短褲': 'fonˊ kuˋ', '長褲': 'chhongˇ fuˋ', '鞋': 'haiˇ', '水靴筒': 'suiˋ hiˋ thungˇ', '帽仔': 'moˊ eˋ', '頸圍仔': 'giˋ teuˋ eˋ', '膝頭落仔': 'kiˊ teuˇ logˋ eˋ', '黃色': 'vongˋ sedˋ', '白色': 'pagˋ sedˋ', '烏色': 'vuˊ sedˋ' }

function buildQuestionsFromCsv(): Question[] {
  return parseCsv(quizCsv).flatMap((row) => {
    const target: Partial<Record<Slot, string>> = {}
    let valid = true
    const targetTokens = row.target_outfit_ids.split(';').filter(Boolean)
    for (const token of targetTokens) {
      const [, entityAndColor = ''] = token.split(':')
      const [entity] = entityAndColor.split('@')
      const slot = slotByEntity[entity]
      const itemId = targetItemIds[entityAndColor]
      if (!slot || !itemId) { valid = false; break }
      target[slot] = itemId
    }
    if (!valid || !Object.keys(target).length) return []

    const item = row.item.split(',')[0].trim()
    const promptEntity = displayEntityByChinese[item]
    const promptToken = targetTokens.map((token) => token.split(':')[1]).find((token) => token?.startsWith(`${promptEntity}@`))
    const promptColor = promptToken?.split('@')[1] ?? ''
    const color = colorLabels[promptColor] ?? ''
    return [{ id: `csv-${row.stage_id}`, stageId: Number(row.stage_id), verb: row.stage_title.split(',')[0].trim(), context: row.context_text, color, colorPinyin: pinyinByWord[color] ?? color, item, itemPinyin: pinyinByWord[item] ?? item, target, tags: row.must_have.split(',').map((tag) => tag.trim()).filter(Boolean) }]
  })
}

// 題目文字、敘述與目標搭配以 CSV 為來源；尚未有可穿素材的題目會暫時略過。
export const questions: Question[] = buildQuestionsFromCsv()
