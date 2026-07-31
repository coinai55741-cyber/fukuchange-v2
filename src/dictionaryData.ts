import dictionaryEntriesCsv from '../data/i18n/dictionary_entries.csv?raw'

export type DialectCode = 'hak-sihien' | 'hak-hailu' | 'hak-dapu' | 'hak-raoping' | 'hak-zhaoan' | 'hak-namsihien'

export type DictionaryItem = {
  id: string
  type: 'item' | 'color'
  name: string
  pinyin: string
  translation: string
  description: string
  image: string
  hex?: string
  pattern?: boolean
}

type CsvRow = Record<string, string>

const DIALECT_FIELDS: Record<DialectCode, { text: string; pinyin: string }> = {
  'hak-sihien': { text: '四縣客語字', pinyin: '四縣拼音' },
  'hak-hailu': { text: '海陸客語字', pinyin: '海陸拼音' },
  'hak-dapu': { text: '大埔客語字', pinyin: '大埔拼音' },
  'hak-raoping': { text: '饒平客語字', pinyin: '饒平拼音' },
  'hak-zhaoan': { text: '詔安客語字', pinyin: '詔安拼音' },
  'hak-namsihien': { text: '南四縣客語字', pinyin: '南四縣拼音' },
}

function parseCsv(raw: string): CsvRow[] {
  const rows: string[][] = []
  let current = ''
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i]
    const next = raw[i + 1]
    if (char === '"' && inQuotes && next === '"') {
      current += '"'
      i += 1
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      row.push(current)
      current = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1
      row.push(current)
      if (row.some(cell => cell.trim())) rows.push(row)
      row = []
      current = ''
    } else {
      current += char
    }
  }

  if (current || row.length) {
    row.push(current)
    if (row.some(cell => cell.trim())) rows.push(row)
  }

  const headers = rows.shift()?.map(cell => cell.trim()) ?? []
  return rows.map(cells => Object.fromEntries(headers.map((header, index) => [header, cells[index]?.trim() ?? ''])))
}

function toBoolean(value: string) {
  return ['1', 'true', 'TRUE', '是', 'yes', 'Y'].includes(value.trim())
}

export function getDictionaryItems(dialect: DialectCode = 'hak-sihien') {
  const fields = DIALECT_FIELDS[dialect] ?? DIALECT_FIELDS['hak-sihien']
  const fallbackFields = DIALECT_FIELDS['hak-sihien']

  return parseCsv(dictionaryEntriesCsv)
    .filter(row => row['啟用'] !== '否')
    .sort((a, b) => Number(a['排序'] || 999) - Number(b['排序'] || 999))
    .map<DictionaryItem>((row) => {
      const textRaw = row[fields.text]?.trim()
      const pinyinRaw = row[fields.pinyin]?.trim()

      const text = (textRaw && textRaw !== 'V') ? textRaw : (row[fallbackFields.text] && row[fallbackFields.text] !== 'V' ? row[fallbackFields.text] : row['中文釋義'])
      const pinyin = (pinyinRaw && pinyinRaw !== 'V') ? pinyinRaw : (row[fallbackFields.pinyin] && row[fallbackFields.pinyin] !== 'V' ? row[fallbackFields.pinyin] : '')

      return {
        id: row['資料ID'],
        type: row['類型'] === 'color' ? 'color' : 'item',
        name: text,
        pinyin,
        translation: row['中文釋義'],
        description: row['小知識'],
        image: row['圖片檔名'],
        hex: row['色票HEX'],
        pattern: toBoolean(row['是否花布']),
      }
    })
}

export const SHOW_FALLBACK_NOTICE = true

export function getHakkaSentenceComponents(
  item: string,
  color: string,
  context: string,
  dialect: DialectCode,
  isPinyinQuestion: boolean,
  pinyinField: 'color' | 'item'
) {
  const effectiveDialect: DialectCode = (dialect === 'hak-raoping' || dialect === 'hak-zhaoan') ? 'hak-sihien' : dialect
  const items = getDictionaryItems(effectiveDialect)

  // Item Entry & Name / Pinyin
  const itemEntry = items.find(i => i.translation === item || i.name === item)
  const itemWord = itemEntry?.name || item
  const itemPinyin = itemEntry?.pinyin || item

  // Action verb logic
  let verb = '著'
  if (['帽仔', '帽', '膝頭落仔', '膝頭落', '泅水帽', '泅水帽仔', '護膝', '帽子'].includes(item)) {
    verb = '戴'
  } else if (['圍巾', '頸圍仔', '頸纏仔', '頸圍'].includes(item)) {
    if (effectiveDialect === 'hak-namsihien') {
      verb = '枷等'
    } else if (effectiveDialect === 'hak-dapu') {
      verb = '圍核'
    } else {
      verb = '圍等'
    }
  }

  // Color modifier
  let colorText = ''
  if (color) {
    const isFlower = color === '紅色花圖案' || color === '紅色花布'
    const colorEntry = items.find(i => i.translation === color || i.name === color || i.id === 'red_flower_pattern')

    if (isFlower) {
      if (isPinyinQuestion && pinyinField === 'color') {
        colorText = 'fungˇ sedˋ faˊ bu 个 '
      } else {
        if (effectiveDialect === 'hak-hailu') {
          colorText = '花布做个'
        } else if (effectiveDialect === 'hak-dapu') {
          colorText = '花色个'
        } else if (effectiveDialect === 'hak-namsihien') {
          colorText = '花布仔个'
        } else {
          colorText = '花布色个'
        }
      }
    } else {
      const colorWord = colorEntry?.name || color
      const colorPinyin = colorEntry?.pinyin || color
      if (isPinyinQuestion && pinyinField === 'color') {
        colorText = `${colorPinyin} 个 `
      } else {
        colorText = `${colorWord}个`
      }
    }
  }

  const displayItem = (isPinyinQuestion && (!color || pinyinField === 'item')) ? itemPinyin : itemWord
  const badgeText = `${verb}${colorText}${displayItem}`
  const fullText = `${badgeText}${context}`

  return {
    badgeText,
    fullText,
    effectiveDialect,
    isFallback: dialect === 'hak-raoping' || dialect === 'hak-zhaoan'
  }
}

