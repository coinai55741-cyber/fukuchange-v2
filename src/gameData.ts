export type Slot = 'head' | 'neck' | 'body' | 'pants' | 'knee' | 'shoes'
export type ClosetTab = 'tops' | 'bottoms' | 'shoes' | 'accessories'

export type Clothing = {
  id: string
  name: string
  color: string
  slot: Slot
  tab: ClosetTab
  icon: string
}

export type Question = {
  id: string
  context: string
  color: string
  colorPinyin: string
  item: string
  itemPinyin: string
  target: Partial<Record<Slot, string>>
}

export const tabs: { id: ClosetTab; label: string; icon: string }[] = [
  { id: 'tops', label: '上衣', icon: '👕' },
  { id: 'bottoms', label: '下身', icon: '🩳' },
  { id: 'shoes', label: '鞋子', icon: '👟' },
  { id: 'accessories', label: '配件', icon: '🧢' },
]

export const clothing: Clothing[] = [
  { id: 'body-blue', name: '藍衫', color: '藍色', slot: 'body', tab: 'tops', icon: '👔' },
  { id: 'body-yellow', name: '短衫', color: '黃色', slot: 'body', tab: 'tops', icon: '👕' },
  { id: 'body-white', name: '短衫', color: '白色', slot: 'body', tab: 'tops', icon: '👕' },
  { id: 'body-black', name: '短衫', color: '烏色', slot: 'body', tab: 'tops', icon: '👕' },
  { id: 'pants-black', name: '長褲', color: '烏色', slot: 'pants', tab: 'bottoms', icon: '👖' },
  { id: 'pants-yellow', name: '短褲', color: '黃色', slot: 'pants', tab: 'bottoms', icon: '🩳' },
  { id: 'pants-white', name: '裙', color: '白色', slot: 'pants', tab: 'bottoms', icon: '👗' },
  { id: 'pants-blue', name: '長褲', color: '藍色', slot: 'pants', tab: 'bottoms', icon: '👖' },
  { id: 'shoes-white', name: '鞋', color: '白色', slot: 'shoes', tab: 'shoes', icon: '👟' },
  { id: 'shoes-black', name: '鞋', color: '烏色', slot: 'shoes', tab: 'shoes', icon: '👞' },
  { id: 'shoes-rain', name: '水靴筒', color: '黃色', slot: 'shoes', tab: 'shoes', icon: '🥾' },
  { id: 'head-yellow', name: '帽仔', color: '黃色', slot: 'head', tab: 'accessories', icon: '🧢' },
  { id: 'head-black', name: '帽仔', color: '烏色', slot: 'head', tab: 'accessories', icon: '🎩' },
  { id: 'neck-white', name: '頸圍仔', color: '白色', slot: 'neck', tab: 'accessories', icon: '🧣' },
  { id: 'knee-yellow', name: '膝頭落仔', color: '黃色', slot: 'knee', tab: 'accessories', icon: '🧦' },
]

const threePiece = (body: string, pants: string, shoes: string, extras: Partial<Record<Slot, string>> = {}) => ({ body, pants, shoes, ...extras })

export const questions: Question[] = [
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
