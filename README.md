# 穿搭小達人｜工程交接 README

更新日期：2026-08-03  
專案類型：Vue 3 + Vite + TypeScript 單頁互動遊戲  
正式部署：GitHub Pages  
目前網址：`https://coinai55741-cyber.github.io/fukuchange-v2/`

## 1. 專案定位

「穿搭小達人」是要串到網站活動頁中的前端小遊戲。玩家依照題目提示，替角色阿梅選擇符合天氣、場合、衣物與顏色的穿搭，完成 10 題後產生分數、用時、星級/稱號、排行榜與答題回顧。

目前前端已完成：

- 前導故事
- 規則/腔調選擇頁
- 穿搭遊戲主畫面
- 衣櫃與角色換裝
- 題庫抽題
- 四階層計分
- 結果頁
- 排行榜 UI
- 穿搭造句回顧
- 穿搭小詞典
- 手機/桌機 RWD
- 基礎無障礙標籤

目前尚需工程師串接網站端：

- 玩家身分/活動參數
- 排行榜 API
- 成績送出 API
- 若網站有會員/Token，需要接入驗證或 request header
- 若活動平台已有「返回列表」URL，需要替換目前按鈕行為

## 2. 快速啟動

```bash
npm install
npm run dev
npm run build
npm run preview
```

說明：

- `npm run dev`：本機開發，預設常見網址為 `http://127.0.0.1:5173/`
- `npm run build`：正式打包，會先執行 `npm run sync-i18n`
- `npm run preview`：預覽 `dist`
- `npm run sync-i18n`：從 `dictionary_entries.xlsx` 匯出/同步 `dictionary_entries.csv`

## 3. 專案結構

```text
fukuchange_v2/
  .github/workflows/pages.yml
  data/
    dummy/
    i18n/
    images/
    images-items/
    music/
    quiz/
    spine/
    ui/
  public/
  scripts/
  src/
    App.vue
    SpineAvatar.vue
    dictionaryData.ts
    gameData.ts
    leaderboardService.ts
    main.ts
    style.css
  index.html
  package.json
  vite.config.ts
```

## 4. 網站串接重點

### 4.1 建議嵌入方式

本專案目前是 SPA，最簡單的網站串接方式有兩種：

1. 直接把 GitHub Pages / 靜態部署網址放進活動頁 iframe。
2. 將 build 後的 `dist/` 放到網站同網域靜態目錄，活動頁導向該路徑。

若後端 API 有 CORS 或 Cookie 驗證限制，建議用第 2 種同網域部署，會少很多跨域問題。

### 4.2 建議由網站提供的參數

可用 query string 或全域設定注入：

```text
eventId       活動 ID，目前程式暫寫 9
playerId      玩家 ID
displayName   玩家顯示名稱
token         若 API 需要授權
returnUrl     返回活動列表/上一頁網址
```

目前程式內排行榜呼叫使用固定 `eventId = 9`，位置在：

```text
src/App.vue
finishGame()
showLeaderboard()
loadLobbyLeaderboard()
```

正式串接時建議改為從 query string 讀取，例如：

```text
?eventId=9&playerId=xxx&returnUrl=https%3A%2F%2F...
```

## 5. 排行榜串接

排行榜唯一資料入口在：

```text
src/leaderboardService.ts
```

目前是 mock 資料。工程師正式串接時，優先只改這支檔案，不要讓 `App.vue` 直接碰後端原始 API。

### 5.1 目前前端期待的型別

```ts
export type LeaderboardEntry = {
  rank: number
  displayName: string
  score: number
  elapsedMs: number
  submittedAt: string
}

export type LeaderboardResponse = {
  eventId: number
  rankingRule: 'score_desc_elapsed_ms_asc_submitted_at_asc'
  participantCount: number
  playCount: number
  entries: LeaderboardEntry[]
  myEntry?: LeaderboardEntry
}

export type GameResultPayload = {
  score: number
  elapsedMs: number
}
```

### 5.2 需要串接的功能

```ts
leaderboardService.getLeaderboard(eventId)
```

用途：

- 規則頁右側小排行榜
- 結算頁總排名
- 點「查看總排名」時使用

```ts
leaderboardService.submitGameResult(eventId, result)
```

用途：

- 玩家完成 10 題後送出結果
- 回傳最新排行榜與自己的名次

### 5.3 排名規則

目前 UI 依此假設呈現：

```text
分數高者優先
同分時，用時短者優先
再同分時，提交時間早者優先
```

如果後端排序不同，請同步調整 UI 文案或 `rankingRule`。

### 5.4 分數、星級、玩家資料

目前前端已有：

- `score`：總分，0–100
- `elapsedMs`：本輪遊玩時間，毫秒
- `resultTitle`：依總分顯示稱號
- `resultComment`：依總分顯示評語
- `questionReviews`：10 題答題回顧

星級目前建議由前端依分數換算，或由後端回傳。若由前端換算，可用：

```text
100 分：5 星
80–99 分：4 星
60–79 分：3 星
40–59 分：2 星
1–39 分：1 星
0 分：0 星
```

目前 UI 主要顯示稱號與分數，若網站需要星級欄位，建議在 `submitGameResult()` payload 補：

```ts
{
  score: number
  elapsedMs: number
  star: number
  playerId?: string
  displayName?: string
  eventId?: number
}
```

### 5.5 自己在十名外的呈現

`LeaderboardResponse.myEntry` 若 `rank > 10`，畫面會在前十名下方顯示垂直 `...`，再顯示自己的成績列。

請後端務必回傳：

- 前 10 名：`entries`
- 自己名次：`myEntry`

即使自己不在前 10，也要回傳 `myEntry`。

## 6. 題目維護

題目基本上不會頻繁改，只有老師/企劃反應時才調整。

主要題庫：

```text
data/quiz/穿搭小達人 - 出題架構.csv
```

### 6.1 常用欄位

| 欄位 | 用途 | 是否常改 |
|---|---|---|
| `stage_id` | 題目 ID | 不建議改 |
| `stage_title` | 動詞，如 `著`、`戴` | 偶爾 |
| `Pool` | 題池，1 是客語字、2 是拼音題 | 不建議改 |
| `context_text` | 華語情境句 | 會改 |
| `require_color` | 是否題目要抽顏色，目前多數應為 `是` | 少改 |
| `true_color` | 題目這次可以隨機抽哪些顏色 | 會改 |
| `item` | 題目可抽到/可當答案的衣物 | 會改 |
| `allow_colors` | 情境可接受顏色白名單，不會放寬黃色標籤答案 | 偶爾 |
| `deny_colors` | 禁忌式規則的禁止顏色 | 偶爾 |
| `deny_color_feedback_key` | 禁止顏色時使用哪句回饋 | 偶爾 |
| `deny_items` | 禁止衣物 | 偶爾 |
| `must_have` | 天氣/場合/主題標籤 | 重要，需小心 |
| `required_slots` | 本題必須穿好的部位 | 少改 |
| `target_outfit_ids` | 正解穿搭基準 | 工程/企劃確認後再改 |
| `limited_color` | 某顏色最多可出現幾件 | 特殊規則 |
| `limited_color_max` | 搭配 `limited_color` 使用 | 特殊規則 |
| `limited_color_feedback_key` | 超量時的回饋 key | 特殊規則 |

顏色相關欄位分工：

| 欄位 / 畫面 | 用途 |
|---|---|
| 黃色標籤顯示的顏色 | 題目指定答案；玩家必須穿到這個顏色才算題目顏色正確 |
| `true_color` | 題目每次可隨機抽出的顏色來源 |
| `allow_colors` | 情境允許的顏色；只用來判斷整體穿搭是否合適，不拿來放寬黃色標籤答案 |
| `deny_colors` | 情境禁止的顏色；穿到會觸發對應警示 |

範例：如果題目黃色標籤顯示「戴黃色个泅水帽」，玩家必須戴黃色泅水帽才算題目正確。橘色、吊菜色或紅色花圖案泳帽可以是游泳情境允許色，但不會因此算作這題的指定答案。

### 6.2 `Pool` 的意思

遊戲共 10 題：

- 第 1–5 題：Pool 1，顯示客語字
- 第 6–10 題：Pool 2，顯示拼音

兩池可以練到同一個衣物/顏色，但同一池內會盡量避免重複出現同一個客語字或拼音。

### 6.3 題目顯示方式

題目卡片分成：

```text
天氣/季節標題
客語 Badge
華語情境句
```

範例：

```text
☀️ 夏天／熱
著白色个裙
穿去觀賞桐花最合適！充滿在地白色桐花意象，好看又特別。
```

第 2 階段會把題目指定詞的一部分換成拼音。

## 7. 題目邏輯

題目資料在 `src/gameData.ts` 被轉成 `questions`，遊戲流程在 `src/App.vue`。

### 7.1 抽題邏輯

核心函式：

```text
src/App.vue
selectTenDiverseQuestions()
```

目前規則：

- 從 CSV 讀入所有題目。
- 每題會先依 `true_color` 隨機生成一個當輪題目顏色。
- Pool 1 抽 5 題，Pool 2 抽 5 題。
- 同一池內盡量避免題目詞彙重複。
- 同一池內盡量避免客語字/拼音重複。
- 同一池內盡量避免同情境重複。
- 冷、雨、水上、打掃等題型有加權，避免永遠抽不到。
- 若嚴格條件導致題數不足，程式會逐步放寬部分限制，以確保湊滿 10 題。

### 7.2 題目答案來源

每題主要有兩種答案概念：

1. 題目 Badge 指定答案  
   例如：`著 pag sedˋ 个裙`，指定的是「白色裙」。

2. 整體穿搭是否符合情境  
   例如：冬天不能穿短袖短褲；婚宴不能穿雨鞋；大掃除不適合亮色系。

所以玩家可能得到：

- 題目指定物件對，但其他衣服不合情境：6 分
- 題目指定物件錯，但全身穿搭合理：4 分
- 都錯：0 分

### 7.3 驗證邏輯

核心函式：

```text
src/App.vue
submitOutfit()
validateItem()
validateColor()
checkSemanticConflict()
```

驗證分三層：

1. 目標答案檢查  
   是否有穿到本題要求的衣物與顏色。

2. 整體情境檢查  
   身上所有衣物是否符合天氣、場合、禁忌規則。

3. 特殊語意檢查  
   例如熱天不穿羽絨衣、非水上活動不戴泳帽、下雨/打掃才適合雨鞋。

重要：衣物規則目前已改用穩定 ID 判斷，不再用畫面上的中文名稱判斷。

- 衣物內部會帶 `entityId`，例如 `knee_protector`、`rain_boots`、`swim_cap`。
- `allowedItems`、`deny_items`、`target_outfit_ids` 等判斷會先轉成 ID 後再比對。
- 顯示文字可以依六腔改變，但驗證邏輯不會因「膝頭落仔 / 護膝」等不同腔別名稱而誤判。
- 後續新增衣物時，請優先確認字典 ID、題庫 ID、衣櫃資料 `entityId` 是否一致。

### 7.4 特殊情境規則

以下規則屬於企劃定義的特殊情境，不只是單純比對題目指定的衣物/顏色。工程師串接或調整題庫時，請優先保留這些判斷。

| 情境 | 目前規則 | 主要回饋 key / 文案來源 |
|---|---|---|
| 新年拜年 | 完全禁止雨鞋、泳裝、泳帽、防護膝；帽子 OK。黑色或白色系穿搭若達 2 件以上不合適。 | `festive_too_many_dark_colors` |
| 室內婚宴 | 禁止雨鞋、泳裝、泳帽、防護膝；帽子 OK。黑色或白色系穿搭若達 2 件以上不合適。全白與全黑另有各自提示。 | `festive_too_many_dark_colors`、`wedding_all_white`、`wedding_all_black` |
| 社區大掃除 | 黑色、吊菜色、柑仔色可；白色、黃色、紅色花圖案等亮色系不適合。 | `cleaning_bright_color_warning`：亮色系穿搭容易被泥巴弄髒喲！ |
| 游泳/水上活動 | 泳衣、泳帽可用紫色、橘色、紅色花圖案，也可依題庫允許色出題。 | 題庫 `true_color` / `allow_colors` + `water_context_mismatch` |

補充：

- 黑色/白色提示目前分兩層：如果是「全白」或「全黑」，會使用婚宴專用文案；如果是黑白色系比例過高但不是全白/全黑，會使用 `festive_too_many_dark_colors`。
- 玩家會看到的提示文案請維護在 `data/quiz/feedback_messages.csv`。
- 題目的允許色、禁止色、禁止衣物請維護在 `data/quiz/穿搭小達人 - 出題架構.csv`。

### 7.5 分數階層

| 情況 | 分數 |
|---|---:|
| 題目指定答案正確，情境也正確 | 10 |
| 題目指定答案正確，但情境不合 | 6 |
| 題目指定答案錯，但情境合理 | 4 |
| 題目指定答案錯，情境也不合 | 0 |
| 跳過 | 0 |

每題只在第一次送出時記分，避免玩家重複嘗試洗分。

## 8. 回饋文案

正式回饋文案在：

```text
data/quiz/feedback_messages.csv
```

程式會用 `message_key` 找文案。

常見 key：

```text
tier_success
tier_context_wrong_default
tier_target_wrong_context_right
tier_target_and_context_wrong
skip_question
missing_required_outfit
hot_with_warm_clothing
cold_with_summer_clothing
cleaning_bright_color_warning
festive_too_many_dark_colors
```

注意：

- `data/dummy/穿搭規則對照表.csv` 是內部參考，不是目前正式讀取來源。
- 不要在題庫 CSV 塞玩家會看到的內部規則文案。
- 玩家看得到的警告語，優先放 `feedback_messages.csv`。

## 9. 客語、拼音與詞典

目前詞典與遊戲題目詞彙同源：

```text
data/i18n/dictionary_entries.csv
data/i18n/dictionary_entries.xlsx
```

企劃/老師較適合維護：

```text
data/i18n/dictionary_entries.xlsx
```

程式讀取：

```text
data/i18n/dictionary_entries.csv
```

若修改 Excel，需同步匯出 CSV：

```bash
npm run sync-i18n
```

目前同步後會影響：

- 穿搭小詞典顯示。
- 題目 Badge 內的客語字 / 拼音。
- 衣櫃卡片與無障礙朗讀文字。
- 回饋文案裡 `{item}`、`{color}` 這類變數的顯示名稱。

不會影響：

- 驗證邏輯本身。驗證仍使用穩定 ID。
- 題目抽題規則。抽題仍看題庫 CSV 的 `Pool`、`item`、`true_color` 等欄位。

資料關係建議維持：

```text
dictionary_entries.xlsx / dictionary_entries.csv
  負責：六腔客語字、拼音、中文釋義

穿搭小達人 - 出題架構.csv
  負責：題目、可抽衣物、可抽顏色、禁止規則、指定答案

src/gameData.ts
  負責：衣櫃素材、穿在角色上的圖層、衣物 entityId
```

### 9.1 六腔欄位

目前保留：

- 四縣客語字 / 四縣拼音
- 海陸客語字 / 海陸拼音
- 大埔客語字 / 大埔拼音
- 饒平客語字 / 饒平拼音
- 詔安客語字 / 詔安拼音
- 南四縣客語字 / 南四縣拼音

若欄位填 `V`，前端會照樣顯示 `V`，用來提醒還沒補翻譯。

注意：

- `V` 不會自動 fallback 成四縣腔。
- 客語字欄位填 `V`，畫面就顯示 `V`。
- 拼音欄位填 `V`，拼音題也會顯示 `V`。
- 空白欄位才會以中文釋義作為最低限度保底，避免畫面完全空白。

### 9.2 中文釋義

`中文釋義` 供：

- 穿搭小詞典顯示
- 無障礙 alt text 使用
- 工程 mapping 輔助

介面核心操作與無障礙標籤以華語優先，讓 NVDA/Chrome 螢幕閱讀器能穩定朗讀。

## 10. 衣物與角色素材

### 10.1 衣物資料

衣物清單目前主要在：

```text
src/gameData.ts
```

主要型別：

```ts
type Clothing = {
  id: string
  name: string
  color: string
  colorKey: string
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
```

### 10.1.1 衣物 ID 與顯示名稱分工

衣物資料目前分成兩層：

| 類型 | 用途 | 範例 |
|---|---|---|
| 穩定 ID / `entityId` | 程式判斷、驗證、抽題去重 | `knee_protector` |
| 顯示名稱 | 畫面文字、詞典、無障礙朗讀 | 四縣：`膝頭落仔`；詔安：`護膝` |

請不要用畫面名稱做規則判斷。  
例如同一個物件在不同腔別可能顯示不同字，但它仍然是同一個 `entityId`。

新增衣物時請確認：

1. `data/i18n/dictionary_entries.xlsx` 有對應 ID。
2. `src/gameData.ts` 的衣櫃衣物有正確 `entityId`。
3. 題庫裡的 `item`、`deny_items`、`target_outfit_ids` 能對應到同一個 ID。
4. 若有回饋文案使用 `{item}`，前端會依目前腔別顯示該 ID 的客語字。

衣物標籤資料來自：

```text
data/quiz/穿搭小達人 - 單字標籤.csv
```

### 10.2 衣櫃縮圖

使用：

```text
data/images/
```

例如：

```text
shirt.png
shorts_B.png
rain_boots_B.png
hat.png
head-swin.png
```

### 10.3 Spine 角色

使用：

```text
data/spine/正面_角色架構.json
data/spine/正面_角色架構.atlas
data/spine/正面_角色架構.png
data/spine/girl.spine
```

主要程式：

```text
src/SpineAvatar.vue
```

泳帽特殊規則：

- 穿 `泅水帽` 時要切換 `head_swim_cap`
- 一般帽子不換頭
- 泳帽與頭部是組合出現

### 10.4 顏色與花布

目前單色衣物使用 CSS/Spine tint。

特殊：

- 藍衫固定藍染，不抽顏色。
- 紅色花圖案使用花布圖案/花布 attachment，不是單色 tint。
- 花布若要更精細，未來可改成 mask/detail 流程。

## 11. 靜態串接 vs 動態串接

### 11.1 靜態串接

這些資料目前由前端靜態打包或公開部署：

| 類型 | 位置 | 說明 |
|---|---|---|
| 題庫 | `data/quiz/穿搭小達人 - 出題架構.csv` | 題目、答案、限制規則 |
| 衣物標籤 | `data/quiz/穿搭小達人 - 單字標籤.csv` | 動詞、天氣、場合、黑名單 |
| 回饋文案 | `data/quiz/feedback_messages.csv` | 玩家會看到的提示 |
| 詞典/六腔 | `data/i18n/dictionary_entries.csv` | 客語字、拼音、中文釋義 |
| 角色素材 | `data/spine/` | Spine runtime |
| 衣物圖片 | `data/images/` | 衣櫃縮圖/花布 |
| 背景與故事圖 | `data/images-items/` | BG、人物、結果頁圖 |
| 音效 | `data/music/` | click/next/false/bgm |
| UI icon | `data/ui/` | 返回、音效、排名 icon |

這些資料如果改了，要重新 build / deploy。

### 11.2 動態串接

正式網站應該動態提供：

| 類型 | 建議來源 |
|---|---|
| 玩家 ID | 網站會員/活動系統 |
| 玩家顯示名稱 | 網站會員/活動系統 |
| 活動 ID | query string 或頁面注入 |
| 排行榜前 10 | API |
| 玩家自己的排名 | API |
| 送出成績 | API |
| 參加人數/遊玩次數 | API |
| 返回列表網址 | 活動頁提供 |
| API token/session | 網站登入狀態 |

### 11.3 可視需求決定是否動態化

以下目前是靜態，但未來可改動態：

| 項目 | 何時需要動態化 |
|---|---|
| 題庫 CSV | 老師會頻繁後台改題時 |
| 回饋文案 | 活動營運要即時調文案時 |
| 詞典資料 | 六腔資料常態維護時 |
| 遊戲開關 | 需要 A/B test 或活動期間設定時 |
| 音效/背景 | 活動主題常換時 |

## 12. 網站 API 建議規格

### 12.1 取得排行榜

```http
GET /api/events/{eventId}/leaderboard?playerId={playerId}
```

建議回傳：

```json
{
  "eventId": 9,
  "rankingRule": "score_desc_elapsed_ms_asc_submitted_at_asc",
  "participantCount": 54,
  "playCount": 121,
  "entries": [
    {
      "rank": 1,
      "displayName": "林O恩",
      "score": 100,
      "elapsedMs": 5000,
      "submittedAt": "2026-07-20T09:00:00Z"
    }
  ],
  "myEntry": {
    "rank": 16,
    "displayName": "測○○",
    "score": 60,
    "elapsedMs": 32310,
    "submittedAt": "2026-07-20T09:30:00Z"
  }
}
```

### 12.2 送出成績

```http
POST /api/events/{eventId}/game-results
```

建議 payload：

```json
{
  "playerId": "PLAYER_ID",
  "displayName": "測○○",
  "score": 90,
  "star": 4,
  "elapsedMs": 45321,
  "answers": [
    {
      "questionId": "csv-18",
      "stageId": 18,
      "score": 10,
      "passed": true,
      "skipped": false
    }
  ]
}
```

建議回傳同 `LeaderboardResponse`，前端即可直接更新結果頁。

## 13. 結果頁與答題回顧

結果頁資料來源：

```text
score
elapsedMs
leaderboard
questionReviews
```

`questionReviews` 由前端每題首次送出/跳過時產生，包含：

- 題目 ID
- 題號
- 得分
- 是否通關
- 是否跳過
- 題目 Badge
- 華語情境句
- 玩家穿搭快照 base64
- 回饋文案
- 錯誤衣物提示

目前穿搭快照暫存在瀏覽器記憶體，進結果頁用，不會送到後端。若後端需要保存答題圖，需另外規劃上傳機制，不建議直接把 base64 放進排行榜 API。

## 14. 無障礙交接

目前已做：

- 主要按鈕有 `aria-label`
- 音效按鈕有 `aria-pressed`
- 對話框有 `role="dialog"`
- 題目卡與結果回顧可聚焦
- 排行榜獎牌有 alt 與可朗讀排名文字
- 穿搭快照 alt text 使用華語描述

後續若申請 AA，建議工程師再做：

- 用 Lighthouse / axe / WAVE 掃正式站。
- 用 NVDA + Chrome 實測 Tab 順序。
- 檢查所有 hover 說明是否也能 focus 觸發。
- 檢查色彩對比。
- 檢查手機直式提示是否可被朗讀。
- 確認 iframe 嵌入時 title 與 focus 不會遺失。

## 15. 部署

GitHub Pages workflow：

```text
.github/workflows/pages.yml
```

Vite base：

```text
vite.config.ts
```

目前 GitHub Pages 路徑為：

```text
/fukuchange-v2/
```

如果改由正式網站同網域部署，可能要調整 `vite.config.ts` 的 `base`。

## 16. 工程師接手建議順序

1. 先跑本機：

   ```bash
   npm install
   npm run dev
   npm run build
   ```

2. 確認網站嵌入方式：

   - iframe
   - 靜態頁路徑
   - 活動頁內嵌 Vue bundle

3. 串 `leaderboardService.ts`：

   - `getLeaderboard`
   - `submitGameResult`

4. 串玩家資料：

   - eventId
   - playerId
   - displayName
   - token/session
   - returnUrl

5. 確認 API 回傳與 UI 對齊：

   - 前 10 名
   - 自己名次
   - 參加人數
   - 遊玩次數
   - 排名規則

6. 跑一輪完整遊戲：

   - 正確 10 分
   - 情境錯 6 分
   - 目標錯 4 分
   - 跳題 0 分
   - 結果送出
   - 排行榜更新

7. 做正式站 AA 檢測。

## 17. 目前需注意的資料狀態

- `data/dummy/` 裡是備用/內部參考資料，目前不被正式遊戲讀取。
- `data/i18n/dictionary_entries.xlsx` 保留給企劃填寫，不是前端直接讀取；前端讀 CSV。
- 題目邏輯仍有少量特殊規則寫在 `src/App.vue`，例如婚宴/拜年黑白色比例、冷熱衣物、泳裝場景、雨鞋場景。若未來題庫更常調整，建議把特殊規則逐步資料化。

## 18. 常見修改位置

| 想修改 | 主要位置 |
|---|---|
| 題目情境句 | `data/quiz/穿搭小達人 - 出題架構.csv` |
| 題目可抽顏色 | `true_color` |
| 題目可抽衣物 | `item` |
| 禁止顏色 | `deny_colors` |
| 禁止衣物 | `deny_items` |
| 特定顏色最多幾件 | `limited_color` / `limited_color_max` |
| 玩家提示文案 | `data/quiz/feedback_messages.csv` |
| 客語字/拼音/中文釋義 | `data/i18n/dictionary_entries.xlsx` → 匯出 CSV |
| 回饋文案裡的 `{item}` / `{color}` 顯示 | `data/i18n/dictionary_entries.xlsx` → 匯出 CSV |
| 衣物規則判斷 ID | `data/quiz/穿搭小達人 - 出題架構.csv` + `src/gameData.ts` |
| 衣櫃圖片 | `data/images/` + `src/gameData.ts` |
| 角色穿搭 | `data/spine/` + `src/SpineAvatar.vue` |
| 排行榜串接 | `src/leaderboardService.ts` |
| 結果頁 | `src/App.vue` + `src/style.css` |
| 背景圖 | `data/images-items/` + `backgroundImageForQuestion()` |
| 音效 | `data/music/` + `playSound()` |

## 19. 給後端/網站工程師的最短摘要

如果只要串網站，請先看這三個檔：

```text
src/leaderboardService.ts
src/App.vue
vite.config.ts
```

必接：

- `getLeaderboard(eventId)`
- `submitGameResult(eventId, { score, elapsedMs, star?, playerId?, displayName? })`
- 活動頁傳入 `eventId/playerId/displayName/returnUrl`

不要優先動：

- 題庫 parser
- Spine 換裝
- 計分規則

除非老師/企劃要改題或改判定。
