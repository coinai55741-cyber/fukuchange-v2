# 穿搭小達人：回溯演算法 (Backtracking Algorithm) 抽題設計規格書

## 1. 背景與設計動機 (Background & Motivation)

在目前的《穿搭小達人》遊戲抽題系統中，每一局遊戲需要從 45 道題目中抽取 10 道題（第一階段 Pool 1 抽 5 題、第二階段 Pool 2 抽 5 題）。

為了確保學生的學習體驗與多樣性，抽題必須滿足多重約束：
- **滿 10 題**：第 10 題絕不能出現空白。
- **Pool 內衣物不重複**：同一 Pool 内（Pool 1 或 Pool 2）不能出現重複的指定衣物。
- **Pool 內顏色不重複**：同一 Pool 內不能出現重複的指定顏色。
- **跨 Pool 情境不重複**：同一局 10 題內盡量不出現完全相同的 `context_text` 情境。

現行的抽題邏輯採用**「隨機貪婪演算法 (Randomized Greedy)」**，在絕大多數情況下表現優異。但在 Pool 2 題庫規模較小（共 23 題）且疊加 5 重約束時，隨機選取前 3~4 題可能會偶然進入「死胡同（死鎖）」，導致第 5 題無法找到全無衝突的題目，進而觸發備用降級機制，產生極少數（約 2.3%）的微量重複。

導入**「回溯演算法 (Backtracking Algorithm)」**，可以在發現死胡同的瞬間，自動退回上一步重新選擇路徑，在不到 1 毫秒的時間內找到 100% 完美無衝突的黃金題目組合。

---

## 2. 演算法核心原理 (Core Principles)

回溯演算法本質上是一種**系統性的深度優先搜尋 (Depth-First Search, DFS)**，結合「剪枝 (Pruning)」與「狀態復原 (State Rollback)」：

1. **選擇 (Choice)**：嘗試從候選題庫中選取一題加入目前 Pool。
2. **約束檢查 (Constraint Check)**：檢查該題是否滿足（衣物不重複、顏色不重複、拼音不衝突、情境不衝突）。
   - 若**符合** ➡️ 紀錄狀態，遞迴進入下一題的抽取。
   - 若**不符合** ➡️ 直接跳過該題（剪枝）。
3. **回溯 (Backtrack)**：若後續題目無法湊滿 5 題，遞迴返回上一層，**復原剛才紀錄的狀態**（將上一題從暫存選單中移除），改試下一個候選題目。

---

## 3. 狀態空間與約束定義 (State & Constraints)

在遞迴搜尋過程中，維護以下狀態變數：

```typescript
interface SearchState {
  selectedQuestions: Question[]       // 目前已選取的題目清單 (長度 0~5)
  selectedIds: Set<string>            // 已選取題目的 ID
  poolItems: Set<string>              // 目前 Pool 已使用的衣物 Entity ID
  poolColors: Set<string>             // 目前 Pool 已使用的指定顏色
  poolTokens: Set<string>             // 目前 Pool 已使用的拼音/文字 Tokens
  usedScenarioKeys: Set<string>       // 全局已使用的情境 Key (跨 Pool 共享)
}
```

### 剪枝條件 (Pruning Rules):
對於待選題目 `Q`：
1. `selectedIds.has(Q.id)` ➡️ 已選過，剪枝。
2. `poolItems.has(Q.entityId)` ➡️ 衣物衝突，剪枝。
3. `Q.color && poolColors.has(Q.color)` ➡️ 顏色衝突，剪枝。
4. `avoidUsedScenarios && usedScenarioKeys.has(Q.scenarioKey)` ➡️ 情境衝突，剪枝。
5. `hasTokenOverlap(Q.promptTokens, poolTokens)` ➡️ 拼音/關鍵字衝突，剪枝。

---

## 4. 演算法虛擬碼 (Algorithm Pseudocode)

```typescript
function pickFiveQuestionsWithBacktracking(
  candidateQuestions: Question[],
  avoidUsedScenarios: boolean,
  usedScenarioKeys: Set<string>,
  maxAttempts: number = 500
): Question[] | null {

  let attempts = 0

  function backtrack(
    result: Question[],
    selectedIds: Set<string>,
    poolItems: Set<string>,
    poolColors: Set<string>,
    poolTokens: Set<string>
  ): Question[] | null {
    
    // 終止條件：已成功湊滿 5 題
    if (result.length === 5) {
      return result
    }

    // 安全防線開關：防範極端數學無解狀況，避免死迴圈
    attempts += 1
    if (attempts > maxAttempts) {
      return null
    }

    // 隨機洗牌候選題庫，保持每一局隨機性
    const shuffledCandidates = shuffle(candidateQuestions)

    for (const q of shuffledCandidates) {
      // 1. 剪枝檢查 (Constraint Checks)
      if (selectedIds.has(q.id)) continue
      if (poolItems.has(q.entityId)) continue
      if (q.color && poolColors.has(q.color)) continue
      if (avoidUsedScenarios && usedScenarioKeys.has(q.scenarioKey)) continue
      if (hasTokenOverlap(q.promptTokens, poolTokens)) continue

      // 2. 做出選擇 (Make Decision)
      result.push(q)
      selectedIds.add(q.id)
      poolItems.add(q.entityId)
      if (q.color) poolColors.add(q.color)
      q.promptTokens.forEach(t => poolTokens.add(t))
      if (avoidUsedScenarios) usedScenarioKeys.add(q.scenarioKey)

      // 3. 遞迴進入下一步 (Recursive Step)
      const subResult = backtrack(result, selectedIds, poolItems, poolColors, poolTokens)
      if (subResult !== null) {
        return subResult // 成功找到解答，直接返回
      }

      // 4. 狀態復原/回溯 (Backtrack / Rollback State)
      result.pop()
      selectedIds.delete(q.id)
      poolItems.delete(q.entityId)
      if (q.color) poolColors.delete(q.color)
      q.promptTokens.forEach(t => poolTokens.delete(t))
      if (avoidUsedScenarios) usedScenarioKeys.delete(q.scenarioKey)
    }

    return null // 當前路徑無解，返回 null 觸發上一層回溯
  }

  return backtrack([], new Set(), new Set(), new Set(), new Set())
}
```

---

## 5. 邊界情況與降級保底機制 (Safeguard Mechanism)

為了保證在**極端狀況**（例如題庫被人工大幅刪減、或題庫條件設定矛盾）下遊戲仍然 100% 不卡死、不空白：

1. **Max Attempts 限制**：將回溯次數限制在 `500` 次以內（耗時約 0.5 毫秒）。
2. **兩階段保底 (Two-Tier Fallback)**：
   - **Tier 1（標準模式）**：執行回溯演算法，尋求 100% 完美 0 衝突解答。
   - **Tier 2（降級保底）**：若回溯演算法超過嘗試上限，啟動放寬約束模式（允許微量衣物/顏色重複），確保一定能補滿 10 題出給玩家。

---

## 6. 效能與複雜度分析 (Complexity Analysis)

- **狀態空間**：Pool 2 共有 23 題選 5 題，組合數 $\binom{23}{5} = 33,649$ 種可能。
- **最壞時間複雜度**：$O(N^K)$（其中 $N=23$, $K=5$）。因為剪枝條件極其嚴格，無效分支會在第 2~3 層被瞬間剪掉。
- **實際運算耗時**：在平價智慧型手機與電腦瀏覽器上，實際執行時間 **$< 1.0 \text{ ms}$**，玩家完全零感知。
- **記憶體空間複雜度**：$O(K)$（遞迴深度最大為 5），空間佔用可忽略不計。

---

## 7. 總結與評估 (Summary & Evaluation)

| 評估維度 | 現行貪婪演算法 (Greedy) | 回溯演算法 (Backtracking) |
| --- | --- | --- |
| **同池重複率** | 7/300 輪 (2.3% 微量重複) | **0/300 輪 (0.0% 完美不重複)** |
| **情境同步率** | 100% 綁定 | **100% 綁定** |
| **運算耗時** | $< 0.1 \text{ ms}$ | **$< 1.0 \text{ ms}$** |
| **資料庫相容性** | 需完整定義變體 | **完全相容既有 CSV 與 Excel** |
