import type { PlayerState } from '@lejv-party/domain'

type Props = {
  players: PlayerState[]
  scores: Record<string, number>
  hostId: string
  selfId: string
  highlightScorer?: string | null
}

export function Leaderboard(props: Props) {
  const ordered = props.players.slice().sort((a, b) => {
    const da = props.scores[a.id] ?? 0
    const db = props.scores[b.id] ?? 0
    if (db !== da) return db - da
    return a.joinedAt - b.joinedAt
  })

  return (
    <view className="card">
      <text className="card__title">排行榜</text>
      {ordered.map((p, idx) => {
        const highlight = p.id === props.highlightScorer
        return (
          <view
            key={p.id}
            className={highlight ? 'row row--highlight' : 'row'}
          >
            <view className="row__left">
              <text className="row__rank">{idx + 1}.</text>
              <text className="row__name">
                {p.nickname}
                {p.id === props.hostId ? ' 👑' : ''}
                {p.id === props.selfId ? '（你）' : ''}
                {!p.connected ? ' · 离线' : ''}
              </text>
            </view>
            <text className="row__score">{props.scores[p.id] ?? 0}</text>
          </view>
        )
      })}
    </view>
  )
}
