import type { GameStatePublic, PlayerState } from '@lejv-party/domain'

import { useNow } from '../../../hooks/useNow.js'
import { Leaderboard } from './Leaderboard.js'

type Props = {
  players: PlayerState[]
  hostId: string
  playerId: string
  game: GameStatePublic
}

export function RevealPanel(props: Props) {
  const now = useNow(true)
  const current = props.game.current
  const scorer = current?.scorer
  const scorerName = scorer
    ? (props.players.find((p) => p.id === scorer)?.nickname ?? '匿名')
    : null

  const nextAt = current?.revealAt
  const nextInSec =
    nextAt === undefined ? null : Math.max(0, Math.ceil((nextAt - now) / 1000))

  return (
    <view className="stack">
      <view className="card">
        <text className="muted">第 {props.game.questionIndex} 题 · 答案揭晓</text>
        <text className="title">{current?.title ?? '—'}</text>
        <text className="muted">{current?.artist ?? ''}</text>
        <view className="quote">
          {scorerName ? (
            <text className="ok">🎉 {scorerName} 抢答正确，+1 分</text>
          ) : (
            <text className="muted">本题无人答对</text>
          )}
        </view>
        {nextInSec !== null ? (
          <text className="muted">{nextInSec} 秒后进入下一题…</text>
        ) : null}
      </view>

      <Leaderboard
        players={props.players}
        scores={props.game.scores}
        hostId={props.hostId}
        selfId={props.playerId}
        highlightScorer={current?.scorer ?? null}
      />
    </view>
  )
}
