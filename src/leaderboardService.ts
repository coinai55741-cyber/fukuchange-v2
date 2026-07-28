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

const mockEntries: LeaderboardEntry[] = [
  { rank: 1, displayName: '林O恩', score: 100, elapsedMs: 5000, submittedAt: '2026-07-20T09:00:00Z' },
  { rank: 2, displayName: '張O彤', score: 100, elapsedMs: 9000, submittedAt: '2026-07-20T09:02:00Z' },
  { rank: 3, displayName: '陳O宇', score: 100, elapsedMs: 10000, submittedAt: '2026-07-20T09:04:00Z' },
  { rank: 4, displayName: '李O澄', score: 100, elapsedMs: 11000, submittedAt: '2026-07-20T09:06:00Z' },
  { rank: 5, displayName: '黃O妍', score: 100, elapsedMs: 12000, submittedAt: '2026-07-20T09:08:00Z' },
  { rank: 6, displayName: '劉O安', score: 90, elapsedMs: 8500, submittedAt: '2026-07-20T09:10:00Z' },
  { rank: 7, displayName: '曾O晴', score: 90, elapsedMs: 11000, submittedAt: '2026-07-20T09:12:00Z' },
  { rank: 8, displayName: '羅O庭', score: 80, elapsedMs: 7800, submittedAt: '2026-07-20T09:14:00Z' },
  { rank: 9, displayName: '鍾O睿', score: 80, elapsedMs: 10200, submittedAt: '2026-07-20T09:16:00Z' },
  { rank: 10, displayName: '彭O萱', score: 70, elapsedMs: 9700, submittedAt: '2026-07-20T09:18:00Z' },
]

const mockMyEntryOutsideTopTen: LeaderboardEntry = {
  rank: 16,
  displayName: '測○○',
  score: 60,
  elapsedMs: 32310,
  submittedAt: '2026-07-20T09:30:00Z',
}

/**
 * 唯一的排行榜資料入口。正式串接時在此改為 API 呼叫，畫面元件不需改動。
 *
 * API 串接保留格式：
 * - entries：排行榜前 10 名。
 * - myEntry：目前玩家自己的排名；若 rank > 10，畫面會在前 10 名下方顯示「...」與自己的成績列。
 */
export const leaderboardService = {
  async getLeaderboard(eventId: number): Promise<LeaderboardResponse> {
    return {
      eventId,
      rankingRule: 'score_desc_elapsed_ms_asc_submitted_at_asc',
      participantCount: 53,
      playCount: 120,
      entries: mockEntries.slice(0, 10),
      myEntry: mockMyEntryOutsideTopTen,
    }
  },

  async submitGameResult(eventId: number, result: GameResultPayload): Promise<LeaderboardResponse> {
    const myEntry: LeaderboardEntry = {
      rank: 16,
      displayName: '測○○',
      score: result.score,
      elapsedMs: result.elapsedMs,
      submittedAt: new Date().toISOString(),
    }

    return {
      eventId,
      rankingRule: 'score_desc_elapsed_ms_asc_submitted_at_asc',
      participantCount: 54,
      playCount: 121,
      entries: mockEntries.slice(0, 10),
      myEntry,
    }
  },
}
