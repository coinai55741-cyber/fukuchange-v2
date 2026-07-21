export type DictionaryItem = { name: string; pinyin: string; translation: string; description: string; image: string }

export const dictionaryItems: DictionaryItem[] = [
  { name: '短衫', pinyin: 'donˋ qiu', translation: '短袖上衣', description: '透氣清爽的短袖棉質上衣，適合夏日活動。', image: 'shirt.png' },
  { name: '長褲', pinyin: 'congˇ fu', translation: '長褲', description: '適合在郊外穿，能遮擋蚊蟲。', image: 'long_pants_B.png' },
  { name: '短褲', pinyin: 'donˋ fu', translation: '短褲', description: '運動與高溫天氣的清涼選擇。', image: 'shorts_B.png' },
  { name: '裙', pinyin: 'kiunˇ', translation: '裙子', description: '舒適的日常或宴會的優雅打扮。', image: 'skirt_B_over.png' },
  { name: '羽絨衫', pinyin: 'iˋ iungˇ samˊ', translation: '羽絨衣', description: '極致防寒的羽絨外套，適合寒冬出門穿搭。', image: 'puffer_jacket_B.png' },
  { name: '膨線衫', pinyin: 'pong xien samˊ', translation: '毛衣', description: '針織膨線毛衣，觸感溫暖舒適。', image: 'sweater_B.png' },
  { name: '頸圍仔', pinyin: 'giangˋ viˇ eˋ', translation: '圍巾', description: '繞在脖子上的保暖毛織品。', image: 'scarf_B.png' },
  { name: '鞋', pinyin: 'haiˇ', translation: '鞋子', description: '適合健行等活動的運動鞋。', image: 'sneakers_B.png' },
  { name: '水靴筒', pinyin: 'suiˋ hioˊ tungˇ', translation: '雨鞋／雨靴', description: '防水防泥的橡膠中筒雨靴。', image: 'rain_boots_B.png' },
  { name: '帽仔', pinyin: 'mo eˋ', translation: '帽子', description: '遮太陽的帽子。', image: 'hat.png' },
  { name: '膝頭落仔', pinyin: 'qidˋ teuˇ labˋ eˋ', translation: '護膝', description: '溜直排輪時套在膝蓋上的防磨防撞護具。', image: 'knee_protector_B.png' },
  { name: '藍衫', pinyin: 'lamˇ samˊ', translation: '客家藍衫', description: '傳統客家婦女的經典藍染大襟衫。', image: 'hakka_shirt_B.png' },
  { name: '泅水帽', pinyin: 'qiuˇ suiˋ moapˋ', translation: '泳帽', description: '在游泳池中必須穿的專用配件。', image: 'head-swin.png' },
  { name: '泅水衫', pinyin: 'siuˊ suiˋ samˊ', translation: '泳衣', description: '戲水時穿著的專用服裝。', image: 'swimsuit_B.png' },
]

export const dictionaryColors = [
  { name: '柑仔色', pinyin: 'gamˊ eˋ sedˋ', translation: '橘色', hex: '#f97316' },
  { name: '黃色', pinyin: 'vongˇ sedˋ', translation: '黃色', hex: '#eab308' },
  { name: '白色', pinyin: 'pag sedˋ', translation: '白色', hex: '#ffffff' },
  { name: '烏色', pinyin: 'vuˊ sedˋ', translation: '黑色', hex: '#1e293b' },
  { name: '吊菜色', pinyin: 'diau coi sedˋ', translation: '紫色', hex: '#542480' },
  { name: '紅色花圖案', pinyin: 'fungˇ sedˋ faˊ bu', translation: '紅色花布', hex: '#ec4899', pattern: true },
]
