import { useCallback, useEffect, useState } from '@lynx-js/react'
import { ApiRequestError, skipQuestion, submitAnswer } from '@lejv-party/api-client'
import type { GameStatePublic, PlayerState } from '@lejv-party/domain'

import { useNow } from '../../../hooks/useNow.js'
import { Leaderboard } from './Leaderboard.js'

type Props = {
  roomId: string
  playerId: string
  hostId: string
  players: PlayerState[]
  game: GameStatePublic
}

export function QuestionPanel(props: Props) {
  const isHost = props.playerId === props.hostId
  const now = useNow(true)
  const current = props.game.current
  const remainingSec = Math.max(
    0,
    Math.ceil(((current?.deadlineAt ?? now) - now) / 1000),
  )

  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [selfAnswered, setSelfAnswered] = useState(false)
  const [selfCorrect, setSelfCorrect] = useState<boolean | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    setAnswer('')
    setSubmitting(false)
    setSelfAnswered(false)
    setSelfCorrect(null)
    setFeedback(null)
  }, [props.game.questionIndex])

  const onSubmit = useCallback(() => {
    const trimmed = answer.trim()
    if (!trimmed || submitting || selfAnswered) return
    setSubmitting(true)
    setFeedback(null)
    void submitAnswer(props.roomId, props.playerId, trimmed)
      .then((body) => {
        setSelfAnswered(true)
        setSelfCorrect(body.correct)
        setFeedback(body.correct ? '答对了！' : '答错了')
      })
      .catch((err: unknown) => {
        if (err instanceof ApiRequestError) {
          if (err.body.error === 'ALREADY_ANSWERED') {
            setSelfAnswered(true)
            setFeedback('你已作答')
          } else if (err.body.error === 'NOT_IN_QUESTION') {
            setFeedback('本题已结束')
          } else {
            setFeedback('提交失败')
          }
        } else {
          setFeedback('提交失败')
        }
      })
      .finally(() => setSubmitting(false))
  }, [answer, props.playerId, props.roomId, selfAnswered, submitting])

  const onSkip = useCallback(() => {
    if (!isHost) return
    void skipQuestion(props.roomId, props.playerId).catch(() => {
      // best-effort
    })
  }, [isHost, props.playerId, props.roomId])

  return (
    <view className="stack">
      <view className="card">
        <view className="card__header">
          <text className="muted">第 {props.game.questionIndex} 题</text>
          <text className={remainingSec <= 10 ? 'countdown countdown--warn' : 'countdown'}>
            {remainingSec}s
          </text>
        </view>
        <view className="quote">
          <text className="quote__text">
            “{current?.translation ?? '…'}”
          </text>
        </view>

        <view className="field">
          <input
            className="input"
            value={answer}
            placeholder={selfAnswered ? '你已作答' : '输入歌名'}
            maxlength={64}
            disabled={selfAnswered || submitting}
            bindinput={(e) => setAnswer(e.detail.value)}
          />
        </view>
        <view
          className={
            selfAnswered || submitting || !answer.trim()
              ? 'primary primary--disabled'
              : 'primary'
          }
          bindtap={onSubmit}
        >
          <text className="primary__text">
            {submitting ? '提交中…' : '抢答'}
          </text>
        </view>
        {feedback ? (
          <text className={selfCorrect ? 'ok' : 'error'}>{feedback}</text>
        ) : null}

        <text className="muted">
          已作答：{current?.answeredCount ?? 0} / {props.players.length}
        </text>

        {isHost ? (
          <view className="secondary" bindtap={onSkip}>
            <text className="secondary__text">下一题（跳过）</text>
          </view>
        ) : null}
      </view>

      <Leaderboard
        players={props.players}
        scores={props.game.scores}
        hostId={props.hostId}
        selfId={props.playerId}
      />
    </view>
  )
}
