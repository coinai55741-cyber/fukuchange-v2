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
    .map<DictionaryItem>((row) => ({
      id: row['資料ID'],
      type: row['類型'] === 'color' ? 'color' : 'item',
      name: row[fields.text] || row[fallbackFields.text] || row['中文釋義'] || row['資料ID'],
      pinyin: row[fields.pinyin] || row[fallbackFields.pinyin],
      translation: row['中文釋義'],
      description: row['小知識'],
      image: row['圖片檔名'],
      hex: row['色票HEX'],
      pattern: toBoolean(row['是否花布']),
    }))
}
