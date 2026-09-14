import { useCallback } from '@lynx-js/react'
import type { GameStatePublic, PlayerState } from '@lejv-party/domain'
import { Button } from '@lynx-js/lynx-ui'
import { close } from 'sparkling-navigation'

import { Leaderboard } from './Leaderboard.js'

type Props = {
  players: PlayerState[]
  hostId: string
  playerId: string
  game: GameStatePublic
}

export function EndedPanel(props: Props) {
  const winnerId = props.game.winner ?? null
  const winnerName = winnerId
    ? (props.players.find((p) => p.id === winnerId)?.nickname ?? '匿名')
    : null
  const lastTitle = props.game.current?.title
  const lastArtist = props.game.current?.artist

  const onClose = useCallback(() => {
    close()
  }, [])

  return (
    <view className="stack">
      <view className="card">
        <text className="muted">比赛结束</text>
        {winnerName ? (
          <text className="title">🏆 {winnerName} 获胜！</text>
        ) : (
          <text className="title">比赛提前结束</text>
        )}
        {lastTitle ? (
          <view className="quote">
            <text className="muted">最后一题</text>
            <text className="row__name">{lastTitle}</text>
            {lastArtist ? <text className="muted">{lastArtist}</text> : null}
          </view>
        ) : null}
        <Button className="btn btn--secondary" onClick={onClose}>
          <text className="btn__text">关闭</text>
        </Button>
      </view>

      <Leaderboard
        players={props.players}
        scores={props.game.scores}
        hostId={props.hostId}
        selfId={props.playerId}
        highlightScorer={props.game.winner ?? null}
      />
    </view>
  )
}
