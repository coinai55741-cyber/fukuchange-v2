# 穿搭小達人工程交接文件

更新日期：2026-07-23  
專案路徑：`D:\Yezi\G_project\S2_mission_game\fukuchange_v2`  
GitHub：`https://github.com/coinai55741-cyber/fukuchange-v2`  
GitHub Pages：`https://coinai55741-cyber.github.io/fukuchange-v2/`

## 1. 專案概述

本專案是 Vue 3 + Vite 製作的「穿搭小達人」網頁遊戲。玩家依照題目中的天氣、季節、場合、衣物與顏色要求，幫角色阿梅完成穿搭。

目前遊戲流程：

1. 前導故事。
2. 遊戲說明 / 規則頁。
3. 選擇客語腔調。
4. 進入 10 題穿搭任務。
5. 題目 1–5 顯示中文情境題。
6. 題目 6–10 顯示客語拼音詞彙。
7. 完成後顯示分數與排行榜。

目前排行榜為 mock 資料，API 串接位置已預留。

## 2. 技術架構

主要技術：

- Vue 3
- Vite
- TypeScript
- PixiJS 8
- Spine Pixi Runtime
- CSV 題庫與規則資料

主要指令：

```bash
npm install
npm run dev
npm run build
npm run preview
```

說明：

- `npm install`：安裝本機套件。
- `npm run dev`：啟動本機開發伺服器。
- `npm run build`：產生正式版 `dist`。
- `npm run preview`：預覽正式版 build 結果。

## 3. 目前保留的專案結構

```text
fukuchange_v2
  .github/
    workflows/
      pages.yml
  data/
    images/
    images-items/
    music/
    quiz/
    spine/
    i18n/
  src/
    App.vue
    SpineAvatar.vue
    gameData.ts
    dictionaryData.ts
    leaderboardService.ts
    main.ts
    style.css
  index.html
  package.json
  package-lock.json
  tsconfig.json
  vite.config.ts
  netlify.toml
  穿搭闖關介面規格書.md
  客語腔調與句子在地化架構.md
  工程交接.md
```

## 4. 重要檔案說明

### `src/App.vue`

遊戲主流程與主要畫面。

負責：

- 前導故事
- 規則頁
- 腔調選擇
- 題目顯示
- 衣櫃切換
- 穿搭選取
- 分數判定
- 結果回饋
- 排行榜畫面
- 穿搭小詞典彈窗

如果要改 UI、流程、分數顯示，大多從這裡開始看。

### `src/gameData.ts`

資料轉換核心。

負責讀取：

```text
data/quiz/穿搭小達人 - 出題架構.csv
data/quiz/穿搭小達人 - 單字標籤.csv
data/quiz/穿搭規則對照表.csv
data/quiz/feedback_messages.csv
```

也在此建立：

- 衣物清單 `clothing`
- 題目清單 `questions`
- 規則清單 `rulesConfig`
- 通用回饋文案 `feedbackMessages`

新增衣物、顏色、題庫欄位時，這裡通常需要同步檢查。

### `src/SpineAvatar.vue`

角色 Spine 顯示與換裝邏輯。

負責：

- 載入 Spine skeleton / atlas。
- 根據目前穿搭開關 attachment。
- 泳帽切換頭部。
- CSS / Spine tint 單色染色。
- 花布 attachment 切換。
- 部分衣物前後層排序。

目前載入：

```text
data/spine/正面_角色架構.json
data/spine/正面_角色架構.atlas
data/spine/正面_角色架構.png
```

`data/spine/girl.spine` 是 Spine 編輯源檔，不是前端 runtime 必需，但已保留給工程師或美術後續調整。

### `src/dictionaryData.ts`

穿搭小詞典資料。

負責：

- 衣物詞彙
- 拼音
- 華語釋義
- 小知識
- 顏色詞彙

目前詞典資料是寫在 TypeScript 裡，尚未改成 CSV 讀取。

### `src/leaderboardService.ts`

排行榜資料服務。

目前使用 mock 資料。未來如果要串 API，建議保留同樣的輸出格式，替換內部 `fetchLeaderboard` / `submitGameResult` 實作即可。

目前排序規則：

```text
分數高者優先
同分時用時短者優先
再同分時提交時間早者優先
```

## 5. 題庫資料

題庫位置：

```text
data/quiz/穿搭小達人 - 出題架構.csv
```

目前遊戲會從這份 CSV 建立 10 題。

重要欄位包含：

| 欄位 | 用途 |
|---|---|
| `stage_id` | 題號 / 關卡 ID |
| `stage_title` | 題目動詞來源，通常取逗號前半段 |
| `context_text` | 逗號後情境描述 |
| `item` | 題目指定衣物 |
| `target_outfit_ids` | 正解穿搭 |
| `required_slots` | 本題需要完成的部位 |
| `must_have` | 天氣、場合、主題標籤 |
| `錯誤提示 1：動詞` | 動詞錯誤回饋 |
| `錯誤提示 2：衣物` | 衣物錯誤回饋 |
| `錯誤提示 3：顏色` | 顏色錯誤回饋 |

`target_outfit_ids` 格式範例：

```text
clothes:short_shirt@yellow;pants:shorts@yellow;shoes:shoes@white
```

程式會將 `short_shirt@yellow` 對應到 `gameData.ts` 裡的衣物 ID。

`required_slots` 使用的部位：

```text
head
neck
body
pants
knee
shoes
```

舊欄位如果寫 `clothes`，程式會轉成 `body`。  
舊欄位如果寫 `accessories`，目前程式會轉成 `neck`。

## 6. 單字標籤資料

位置：

```text
data/quiz/穿搭小達人 - 單字標籤.csv
```

用途：

- 定義衣物類型。
- 定義適用動詞。
- 定義天氣與場合標籤。
- 定義禁用場合。

常見 `type`：

```text
normal
rain
water
color
```

目前程式會略過 `type=color` 的列，衣物資料主要從非 color 列建立。

## 7. 穿搭規則與警告文案

位置：

```text
data/quiz/穿搭規則對照表.csv
```

用途：

- 特殊情境規則。
- 顏色/衣物/天氣/場合衝突。
- 指定警告提示。

如果產品端想手動修正特定規則警告語，優先改這份 CSV 的：

```text
警告提示與評語文案
```

通用回饋文案位置：

```text
data/quiz/feedback_messages.csv
```

用途：

- 缺衣物
- 跳題
- 分數階層文字
- 一般錯誤訊息
- 情境不符提示

如果想改這句：

```text
太陽好大！小主人汗流浹背！大夏天穿厚重的羽絨衫或膨線衫實在太悶熱了，快去幫模特兒換上舒適輕便的短衫吧！
```

請到 `feedback_messages.csv` 找：

```text
hot_with_warm_clothing
```

## 8. 分數邏輯

目前分數分四階層：

| 階層 | 分數 | 說明 |
|---|---:|---|
| 完全正確 | 10 | 指定衣物/顏色正確，且整體穿搭符合情境 |
| 目標正確但情境不符 | 6 | 題目指定物件有穿對，但其他穿搭不合天氣或場合 |
| 目標錯誤但情境合理 | 4 | 身上穿搭適合情境，但沒有選到題目指定物件 |
| 目標錯誤且情境不符 | 0 | 指定題目與整體情境都不符合 |

注意：

- 每題首次送出才記分。
- 同一題重複送出不會重複加分。
- 跳題為 0 分。
- `完成搭配 x/y` 只代表指定部位是否有穿，不代表一定正確。

核心程式在：

```text
src/App.vue
submitOutfit()
```

## 9. 衣櫃與衣物資料

衣物資料目前主要寫在：

```text
src/gameData.ts
```

每件衣物有這些重要屬性：

| 屬性 | 說明 |
|---|---|
| `id` | 前端選取與判定用 ID |
| `name` | 中文衣物名稱 |
| `color` | 顯示用顏色名稱 |
| `colorKey` | 程式判定顏色 |
| `colorMode` | `fixed` 或 `dye` |
| `slot` | 穿戴部位 |
| `tab` | 衣櫃分頁 |
| `closetImage` | 衣櫃卡片圖片 |
| `wearLayers` | 預留欄位，目前主要由 Spine attachment 控制 |
| `type` | normal / rain / water |
| `verbs` | 可搭配動詞 |
| `weather` | 冷 / 熱 |
| `occasions` | 場合 |
| `blacklist` | 禁用場合 |

目前衣櫃分頁：

```text
tops        上衣
bottoms     下身
shoes       鞋子
accessories 配件
```

畫面左側部位捷徑：

```text
頭
頸
身
褲
膝
腳
```

點擊部位會連到對應衣櫃分頁，並可用 X 取消該部位衣物。

## 10. 顏色與染色規則

目前顏色：

```text
yellow              黃色
white               白色
black               烏色
orange              柑仔色
purple              吊菜色
red_flower_pattern  紅色花圖案
blue                藍衫固定藍染
```

重要規則：

- 藍衫是固定藍染，不做 CSS / Spine tint 變色。
- 泳衣不產生紅色花圖案版本。
- 泳帽不產生紅色花圖案版本。
- 單色可染衣物用 Spine slot tint。
- 紅色花圖案不是單色，需使用 `_hakka` attachment 或未來 mask/detail 流程。

目前 Spine 顏色設定在：

```text
src/SpineAvatar.vue
tintByColor
tintItem()
attachmentsForItem()
```

## 11. Spine 換裝規則

Spine runtime 素材：

```text
data/spine/正面_角色架構.json
data/spine/正面_角色架構.atlas
data/spine/正面_角色架構.png
```

Spine 編輯源檔：

```text
data/spine/girl.spine
```

角色換裝對應在：

```text
src/SpineAvatar.vue
attachmentByItem
attachmentsForItem()
```

目前重要 attachment：

```text
body_base
head_normal
head_swim_cap
head-swin
shirt
shirt_hakka
shorts_B
shorts_B_hakka
long_pants_B
long_pants_B_hakka
skirt_B_over
skirt_B_over_hakka
hat
hat_hakka
scarf_B
scarf_B_hakka
knee_protector_B
knee_protector_B_hakka
sneakers_B
sneakers_B_hakka
rain_boots_B
rain_boots_B_hakka
puffer_jacket_B
puffer_jacket_B_hakka
sweater_B
sweater_B_hakka
swimsuit_B
swimsuit_B_hakka
hakka_shirt_B
```

### 泳帽特殊規則

戴泳帽時需要同時開：

```text
head_swim_cap
head-swin
```

並且關閉：

```text
head_normal
```

一般帽子不換頭，只有泳帽會換頭。

### 前後層排序

部分衣物前後層由程式調整：

```text
src/SpineAvatar.vue
adjustDrawOrder()
```

目前有處理：

- 膝頭落仔
- 鞋 / 雨鞋
- 裙子前層
- 藍衫
- 羽絨衣

如果後續測試發現「某件衣服應該在另一件上面/下面」，建議不要再改 PSD 命名，直接補在 `adjustDrawOrder()`。

## 12. 素材資料夾

### `data/images`

衣櫃縮圖與部分角色素材。

包含：

- 一般衣物 PNG
- `_hakka` 花布版本
- `hakka_pattern.png`

目前衣櫃縮圖從 `clothing.closetImage` 讀取。

### `data/images-items`

前導故事與背景圖。

目前使用：

```text
S2_m1_BGhot.png
S2_m1_BGwinter.png
S2_m1_BGrain.png
S2_m1_BGnight.png
S2_m1_ame1.png
S2_m1_mom1.png
```

### `data/music`

音效：

```text
S2_m2_click.mp3
S2_m2_false.mp3
S2_m2_next.mp3
```

## 13. 客語腔調與 i18n

目前前端已有六腔選項：

1. 四縣腔
2. 海陸腔
3. 大埔腔
4. 饒平腔
5. 詔安腔
6. 南四縣腔

目前實際題目拼音主要仍以現有資料為準。`data/i18n` 已保留作未來擴充。

保留檔案：

```text
data/i18n/locales.csv
data/i18n/question_localizations.csv
data/i18n/vocabulary_localizations.csv
```

注意：

- 遊戲對話與排行榜 5 星評語稱號，暫不需要多語資料規格。
- 未來若要真正支援六腔，建議將題目文字、單字、拼音從 `gameData.ts` 與固定 CSV 欄位抽到 i18n 表。

## 14. 部署

目前 GitHub Pages 使用：

```text
.github/workflows/pages.yml
```

部署流程：

1. push 到 `main`
2. GitHub Actions 安裝套件
3. 執行 `npm run build`
4. 上傳 `dist`
5. 部署到 GitHub Pages

Vite 設定：

```text
vite.config.ts
```

其中 GitHub Pages base path 為：

```text
/fukuchange-v2/
```

正式網址：

```text
https://coinai55741-cyber.github.io/fukuchange-v2/
```

## 15. 排行榜 API 交接

目前檔案：

```text
src/leaderboardService.ts
```

目前是 mock service。

工程師接 API 時建議保留這個介面：

```ts
fetchLeaderboard(gameId: number)
submitGameResult(gameId: number, result: GameResultPayload)
```

`GameResultPayload`：

```ts
{
  score: number
  elapsedMs: number
}
```

回傳資料建議格式：

```ts
{
  participantCount: number
  playCount: number
  rankingRule: 'score_desc_elapsed_ms_asc_submitted_at_asc',
  entries: [
    {
      rank: number,
      displayName: string,
      score: number,
      elapsedMs: number,
      submittedAt: string
    }
  ]
}
```

如果後端 API 格式不同，建議只改 `leaderboardService.ts` 做 adapter，不要讓 `App.vue` 直接吃後端原始格式。

## 16. 常見修改位置

| 想修改的內容 | 建議修改位置 |
|---|---|
| 題目文字 | `data/quiz/穿搭小達人 - 出題架構.csv` |
| 題目正解 | `target_outfit_ids` |
| 題目需穿部位數 | `required_slots` |
| 衣物標籤/禁用場合 | `data/quiz/穿搭小達人 - 單字標籤.csv` |
| 特殊警告文字 | `data/quiz/穿搭規則對照表.csv` |
| 通用回饋文字 | `data/quiz/feedback_messages.csv` |
| 新增衣物 | `src/gameData.ts` + `data/images` + Spine attachment |
| 改衣櫃 UI | `src/App.vue` + `src/style.css` |
| 改角色穿搭顯示 | `src/SpineAvatar.vue` |
| 改排行榜 | `src/leaderboardService.ts` |
| 改首頁/前導故事 | `src/App.vue` |
| 改詞典 | `src/dictionaryData.ts` |

## 17. 接手注意事項

1. `data` 目前被 Vite 設為 `publicDir`，所以 `data` 裡所有檔案都會被公開部署。
2. 不要把 PSD、參考圖、大量備份檔放進 `data`，除非確定要公開給網站讀取。
3. `node_modules` 和 `dist` 不需要進 Git。
4. 修改 CSV 後請跑 `npm run build`，確認格式沒有造成解析錯誤。
5. 新增衣物時，需要同步考慮三件事：
   - 衣櫃縮圖
   - 題庫/規則判定
   - Spine attachment 顯示
6. 花布不是單色 tint，若要新增更多花布衣物，需準備對應 `_hakka` attachment，或改成 mask/detail 疊圖流程。
7. 泳帽會替換頭，一般帽子不會。
8. 分數目前是四階層，不是單純「有穿指定衣物就 10 分」。

## 18. 建議後續 Roadmap

### 短期

- 確認 10 題所有正解都能拿 10 分。
- 檢查每個分頁所有衣物縮圖與角色穿上後是否一致。
- 補完排行榜 API 實際串接。
- 把詞典資料從 `dictionaryData.ts` 移到 CSV，方便非工程人員維護。

### 中期

- 完成六腔客語資料表讀取。
- 整理 `data/i18n` 並接到前端。
- 建立更完整的衣物 layering 規則表，減少硬寫在 `adjustDrawOrder()`。
- 增加素材檢查工具，確認 CSV 指到的圖片與 Spine attachment 都存在。

### 長期

- 規劃 Spine 動畫。
- 將花布改為更彈性的 mask/detail 或 shader/pattern 疊圖流程。
- 將題庫、規則、詞典、排行榜設定後台化。
- 建立美術交付規範：PSD、Spine、衣櫃縮圖、花布素材命名一致。

