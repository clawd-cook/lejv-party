import { useCallback, useState } from '@lynx-js/react'
import {
  startGame,
  updateRoomConfig,
} from '@lejv-party/api-client'
import type {
  CEFRLevel,
  Era,
  Genre,
  PlayerState,
  RoomConfig,
} from '@lejv-party/domain'
import { Button } from '@lynx-js/lynx-ui'

const LEVELS: readonly CEFRLevel[] = ['A2', 'B1', 'B2', 'C1']
const ERAS: readonly Era[] = ['80s', '90s', '00s', '10s', '20s']
const GENRES: readonly Genre[] = ['流行', '摇滚', '民谣', '说唱', '影视 OST']
const VICTORY_SCORES = [3, 5, 10] as const

type Props = {
  roomId: string
  playerId: string
  hostId: string
  players: PlayerState[]
  config: RoomConfig
}

function ToggleButton(props: {
  label: string
  selected: boolean
  disabled?: boolean
  onClick: () => void
}) {
  const className = [
    'btn',
    'btn--toggle',
    props.selected ? 'is-selected' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Button
      className={className}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      <text className="btn__text">{props.label}</text>
    </Button>
  )
}

export function LobbyPanel(props: Props) {
  const isHost = props.playerId === props.hostId
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canStart =
    isHost && props.config.eras.length > 0 && props.config.genres.length > 0

  const patchConfig = useCallback(
    (patch: Partial<RoomConfig>) => {
      if (!isHost) return
      setError(null)
      void updateRoomConfig(props.roomId, {
        actorId: props.playerId,
        patch,
      }).catch(() => {
        setError('配置更新失败')
      })
    },
    [isHost, props.playerId, props.roomId],
  )

  const toggleEra = useCallback(
    (era: Era) => {
      if (!isHost) return
      const set = new Set(props.config.eras)
      if (set.has(era)) {
        if (set.size <= 1) return
        set.delete(era)
      } else {
        set.add(era)
      }
      patchConfig({ eras: Array.from(set) as Era[] })
    },
    [isHost, patchConfig, props.config.eras],
  )

  const toggleGenre = useCallback(
    (genre: Genre) => {
      if (!isHost) return
      const set = new Set(props.config.genres)
      if (set.has(genre)) {
        if (set.size <= 1) return
        set.delete(genre)
      } else {
        set.add(genre)
      }
      patchConfig({ genres: Array.from(set) as Genre[] })
    },
    [isHost, patchConfig, props.config.genres],
  )

  const onStart = useCallback(() => {
    if (!canStart || starting) return
    setStarting(true)
    setError(null)
    void startGame(props.roomId, props.playerId)
      .catch((e: unknown) => {
        const code =
          e && typeof e === 'object' && 'body' in e
            ? (e as { body?: { error?: string } }).body?.error
            : undefined
        if (code === 'NOT_HOST') setError('仅房主可以开始游戏')
        else if (code === 'ALREADY_STARTED') setError('游戏已经开始')
        else if (code === 'NOT_ENOUGH_PLAYERS') setError('至少需要 1 名玩家')
        else setError('开始游戏失败')
      })
      .finally(() => setStarting(false))
  }, [canStart, props.playerId, props.roomId, starting])

  return (
    <view className="stack">
      <view className="card">
        <text className="muted">房间号</text>
        <text className="room-code">{props.roomId}</text>
        <text className="label">玩家（{props.players.length}）</text>
        {props.players.map((p) => (
          <view key={p.id} className="row">
            <text className="row__name">
              {p.nickname}
              {p.id === props.hostId ? ' 👑' : ''}
              {p.id === props.playerId ? '（你）' : ''}
            </text>
            {!p.connected ? <text className="muted">离线</text> : null}
          </view>
        ))}
      </view>

      <view className="card">
        <text className="card__title">
          出题设置{!isHost ? '（仅房主可修改）' : ''}
        </text>

        <text className="label">词汇量水平（CEFR）</text>
        <view className="chip-row">
          {LEVELS.map((level) => (
            <ToggleButton
              key={level}
              label={level}
              selected={props.config.level === level}
              disabled={!isHost}
              onClick={() => patchConfig({ level })}
            />
          ))}
        </view>

        <text className="label">歌曲年代（至少选 1 项）</text>
        <view className="chip-row">
          {ERAS.map((era) => (
            <ToggleButton
              key={era}
              label={era}
              selected={props.config.eras.includes(era)}
              disabled={!isHost}
              onClick={() => toggleEra(era)}
            />
          ))}
        </view>

        <text className="label">曲风（至少选 1 项）</text>
        <view className="chip-row">
          {GENRES.map((genre) => (
            <ToggleButton
              key={genre}
              label={genre}
              selected={props.config.genres.includes(genre)}
              disabled={!isHost}
              onClick={() => toggleGenre(genre)}
            />
          ))}
        </view>

        <text className="label">胜利分数</text>
        <view className="chip-row">
          {VICTORY_SCORES.map((score) => (
            <ToggleButton
              key={score}
              label={`${score} 分`}
              selected={props.config.victoryScore === score}
              disabled={!isHost}
              onClick={() => patchConfig({ victoryScore: score })}
            />
          ))}
        </view>

        {isHost ? (
          <Button
            className="btn"
            disabled={!canStart || starting}
            onClick={onStart}
          >
            <text className="btn__text">
              {starting ? '准备中…' : '开始游戏'}
            </text>
          </Button>
        ) : (
          <text className="muted">等待房主开始…</text>
        )}
        {error ? <text className="error">{error}</text> : null}
      </view>
    </view>
  )
}
