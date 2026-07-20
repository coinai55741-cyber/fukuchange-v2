export type Slot = 'head' | 'neck' | 'body' | 'pants' | 'knee' | 'shoes'
export type ClosetTab = 'tops' | 'bottoms' | 'shoes' | 'accessories'

export type Clothing = {
  id: string
  name: string
  color: string
  colorKey: 'blue' | 'yellow' | 'white' | 'black' | 'red_flower_pattern'
  colorMode: 'fixed' | 'dye'
  slot: Slot
  tab: ClosetTab
  closetImage: string
  wearLayers: string[]
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

const makeClothing = (id: string, name: string, color: Clothing['color'], colorKey: Clothing['colorKey'], slot: Slot, tab: ClosetTab, closetImage: string, wearLayers = [closetImage], colorMode: Clothing['colorMode'] = 'dye'): Clothing => ({ id, name, color, colorKey, colorMode, slot, tab, closetImage, wearLayers })

export const clothing: Clothing[] = [
  makeClothing('body-blue', '藍衫', '固定藍染', 'blue', 'body', 'tops', 'Hakka-shirt.png', ['Hakka-shirt.png'], 'fixed'),
  makeClothing('body-yellow', '短衫', '黃色', 'yellow', 'body', 'tops', 'shirtB.png'),
  makeClothing('body-white', '短衫', '白色', 'white', 'body', 'tops', 'shirtB.png'),
  makeClothing('body-black', '短衫', '烏色', 'black', 'body', 'tops', 'shirtB.png'),
  // 紅色花圖案只提供給允許的日常衣物；藍衫與泅水衫不可生成此配色。
  makeClothing('body-flower', '短衫', '紅色花圖案', 'red_flower_pattern', 'body', 'tops', 'shirtB.png'),
  makeClothing('pants-black', '長褲', '烏色', 'black', 'pants', 'bottoms', 'Pants.png', ['PantsB.png']),
  makeClothing('pants-yellow', '短褲', '黃色', 'yellow', 'pants', 'bottoms', 'ShortsA.png', ['ShortsB.png']),
  makeClothing('pants-white', '裙', '白色', 'white', 'pants', 'bottoms', 'Skirt.png', ['SkirtB.png']),
  makeClothing('pants-blue', '長褲', '藍色', 'blue', 'pants', 'bottoms', 'Pants.png', ['PantsB.png']),
  makeClothing('pants-flower', '短褲', '紅色花圖案', 'red_flower_pattern', 'pants', 'bottoms', 'ShortsA.png', ['ShortsB.png']),
  makeClothing('shoes-white', '鞋', '白色', 'white', 'shoes', 'shoes', 'ShoeA.png', ['ShoesB.png']),
  makeClothing('shoes-black', '鞋', '烏色', 'black', 'shoes', 'shoes', 'ShoeA.png', ['ShoesB.png']),
  makeClothing('shoes-rain', '水靴筒', '黃色', 'yellow', 'shoes', 'shoes', 'Rain-bootsA.png', ['Rain-bootsB.png']),
  makeClothing('head-yellow', '帽仔', '黃色', 'yellow', 'head', 'accessories', 'hat.png'),
  makeClothing('head-black', '帽仔', '烏色', 'black', 'head', 'accessories', 'hat.png'),
  makeClothing('neck-white', '頸圍仔', '白色', 'white', 'neck', 'accessories', 'ScarfB.png'),
  makeClothing('knee-yellow', '膝頭落仔', '黃色', 'yellow', 'knee', 'accessories', 'Knee-length-socks.png'),
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
