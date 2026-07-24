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
]

/**
 * 唯一的排行榜資料入口。正式串接時在此改為 API 呼叫，畫面元件不需改動。
 */
export const leaderboardService = {
  async getLeaderboard(eventId: number): Promise<LeaderboardResponse> {
    return {
      eventId,
      rankingRule: 'score_desc_elapsed_ms_asc_submitted_at_asc',
      participantCount: 53,
      playCount: 120,
      entries: mockEntries,
    }
  },

  async submitGameResult(eventId: number, result: GameResultPayload): Promise<LeaderboardResponse> {
    const entry: LeaderboardEntry = {
      rank: 0,
      displayName: '測○○',
      score: result.score,
      elapsedMs: result.elapsedMs,
      submittedAt: new Date().toISOString(),
    }
    const entries = [...mockEntries, entry].sort((a, b) =>
      b.score - a.score || a.elapsedMs - b.elapsedMs || a.submittedAt.localeCompare(b.submittedAt),
    ).map((item, index) => ({ ...item, rank: index + 1 }))

    return {
      eventId,
      rankingRule: 'score_desc_elapsed_ms_asc_submitted_at_asc',
      participantCount: 54,
      playCount: 121,
      entries,
      myEntry: entries.find((item) => item.displayName === '測○○'),
    }
  },
}
