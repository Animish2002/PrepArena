import type { Env } from '../types/env'

const BATTLE_DURATION_MS = 45 * 60 * 1000

type SolveRecord = {
  userId: string
  problemIndex: number
  ts: number
}

type BattleState = {
  battleId: string
  challengerId: string
  opponentId: string
  problemIds: string[]
  scores: Record<string, number>
  solves: SolveRecord[]
  status: 'active' | 'completed'
  startedAt: number
}

export class BattleRoom {
  readonly ctx: DurableObjectState
  readonly env: Env

  constructor(ctx: DurableObjectState, env: Env) {
    this.ctx = ctx
    this.env = env
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 })
    }

    const url = new URL(request.url)
    const userId = url.searchParams.get('user_id')!
    const battleId = url.searchParams.get('battle_id')!

    // Load or initialize battle state on first connection
    let state = await this.ctx.storage.get<BattleState>('state')
    if (!state) {
      const row = await this.env.DB.prepare(
        'SELECT id, challenger_id, opponent_id, problem_ids, started_at FROM battles WHERE id = ?',
      )
        .bind(battleId)
        .first<{
          id: string
          challenger_id: string
          opponent_id: string
          problem_ids: string
          started_at: number | null
        }>()

      if (!row) return new Response('Battle not found', { status: 404 })

      const problemIds = JSON.parse(row.problem_ids ?? '[]') as string[]
      const startedAt = row.started_at ?? Date.now()

      state = {
        battleId,
        challengerId: row.challenger_id,
        opponentId: row.opponent_id,
        problemIds,
        scores: { [row.challenger_id]: 0, [row.opponent_id]: 0 },
        solves: [],
        status: 'active',
        startedAt,
      }

      await this.ctx.storage.put('state', state)
      await this.ctx.storage.setAlarm(Date.now() + BATTLE_DURATION_MS)
    }

    const { 0: client, 1: server } = new WebSocketPair()
    server.serializeAttachment({ userId })
    this.ctx.acceptWebSocket(server)

    // Send current state to the joining client
    server.send(
      JSON.stringify({
        type: 'state',
        scores: state.scores,
        problem_ids: state.problemIds,
        status: state.status,
      }),
    )

    return new Response(null, { status: 101, webSocket: client })
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== 'string') return

    const { userId } = ws.deserializeAttachment() as { userId: string }

    let data: { type: string; problem_index?: number }
    try {
      data = JSON.parse(message)
    } catch {
      return
    }

    const state = await this.ctx.storage.get<BattleState>('state')
    if (!state || state.status === 'completed') return

    if (data.type === 'problem_solved' && typeof data.problem_index === 'number') {
      const idx = data.problem_index
      if (idx < 0 || idx >= state.problemIds.length) return

      // Idempotent — ignore if this user already solved this problem
      const alreadySolved = state.solves.some(
        (s) => s.userId === userId && s.problemIndex === idx,
      )
      if (alreadySolved) return

      state.scores[userId] = (state.scores[userId] ?? 0) + 1
      state.solves.push({ userId, problemIndex: idx, ts: Date.now() })
      await this.ctx.storage.put('state', state)

      this.broadcastAll({
        type: 'score_update',
        scores: state.scores,
        solver_id: userId,
        problem_index: idx,
      })
    } else if (data.type === 'battle_complete') {
      await this.endBattle(state)
    }
  }

  webSocketClose(ws: WebSocket, code: number, reason: string): void {
    ws.close(code, reason)
  }

  webSocketError(ws: WebSocket): void {
    ws.close(1011, 'WebSocket error')
  }

  async alarm(): Promise<void> {
    const state = await this.ctx.storage.get<BattleState>('state')
    if (!state || state.status === 'completed') return
    await this.endBattle(state)
  }

  private async endBattle(state: BattleState): Promise<void> {
    state.status = 'completed'
    await this.ctx.storage.put('state', state)

    const winnerId = this.determineWinner(state)

    this.broadcastAll({
      type: 'battle_result',
      winner_id: winnerId,
      scores: state.scores,
    })

    // Best-effort callback to persist results in D1
    try {
      await fetch(`${this.env.WORKER_URL}/internal/battles/${state.battleId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': this.env.INTERNAL_SECRET,
        },
        body: JSON.stringify({
          winner_id: winnerId,
          scores: state.scores,
          challenger_id: state.challengerId,
          opponent_id: state.opponentId,
        }),
      })
    } catch {
      // Non-fatal — the alarm will have already marked state as completed locally
    }
  }

  private determineWinner(state: BattleState): string | null {
    const { challengerId, opponentId, scores, solves, startedAt } = state

    const chalScore = scores[challengerId] ?? 0
    const oppScore = scores[opponentId] ?? 0

    if (chalScore > oppScore) return challengerId
    if (oppScore > chalScore) return opponentId

    // Tied on score — lowest total elapsed time wins
    const totalTime = (uid: string) =>
      solves.filter((s) => s.userId === uid).reduce((sum, s) => sum + (s.ts - startedAt), 0)

    const chalTime = totalTime(challengerId)
    const oppTime = totalTime(opponentId)

    if (chalTime < oppTime) return challengerId
    if (oppTime < chalTime) return opponentId

    return null // True tie
  }

  private broadcastAll(event: object): void {
    const msg = JSON.stringify(event)
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(msg)
      } catch {
        // Closed connection — runtime evicts it
      }
    }
  }
}
