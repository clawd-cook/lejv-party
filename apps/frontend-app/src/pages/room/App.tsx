import { useEffect, useReducer, useState } from '@lynx-js/react'
import { subscribeRoomEvents } from '@lejv-party/api-client'
import {
  clientReducer,
  loadPlayerId,
  savePlayerId,
  type ClientRoomState,
} from '@lejv-party/client-core'

import { ensureApiClientConfigured } from '../../lib/api.js'
import { readRoomRouteParams } from '../../lib/room-params.js'

import { EndedPanel } from './components/EndedPanel.js'
import { LobbyPanel } from './components/LobbyPanel.js'
import { QuestionPanel } from './components/QuestionPanel.js'
import { RevealPanel } from './components/RevealPanel.js'

import './App.css'

export function App(props: { onMounted?: () => void }) {
  const [route] = useState(() => readRoomRouteParams())
  const roomId = route.roomId
  const playerId =
    route.playerId || (roomId ? (loadPlayerId(roomId) ?? '') : '')

  const [state, dispatch] = useReducer(
    clientReducer,
    null as ClientRoomState,
  )

  useEffect(() => {
    ensureApiClientConfigured()
    props.onMounted?.()
  }, [props])

  useEffect(() => {
    if (roomId && playerId) {
      savePlayerId(roomId, playerId)
    }
  }, [roomId, playerId])

  useEffect(() => {
    if (!roomId || !playerId) return

    ensureApiClientConfigured()
    const subscription = subscribeRoomEvents(
      roomId,
      playerId,
      (event) => {
        dispatch({ type: 'event', event })
      },
      { transport: 'fetch' },
    )

    return () => {
      subscription.close()
      dispatch({ type: 'reset' })
    }
  }, [roomId, playerId])

  return (
    <scroll-view className="page-scroll" scroll-orientation="vertical">
      <view className="app">
        <view className="hero">
          <text className="eyebrow">LEJV Party · Room</text>
          <text className="title">歌词猜猜猜</text>
          {roomId ? (
            <text className="subtitle">房间 {roomId}</text>
          ) : (
            <text className="subtitle">缺少房间参数</text>
          )}
        </view>

        {!roomId || !playerId ? (
          <view className="card">
            <text className="card__title">无法进入房间</text>
            <text className="muted">
              需要 scheme 查询参数 roomId 与 playerId（或 p）。当前：roomId=
              {roomId || '∅'} playerId={playerId || '∅'}
            </text>
          </view>
        ) : !state ? (
          <view className="card">
            <text className="muted">正在连接房间 {roomId} …</text>
          </view>
        ) : state.phase === 'lobby' ? (
          <LobbyPanel
            roomId={state.id}
            playerId={playerId}
            hostId={state.hostId}
            players={state.players}
            config={state.config}
          />
        ) : state.phase === 'question' && state.game ? (
          <QuestionPanel
            roomId={state.id}
            playerId={playerId}
            hostId={state.hostId}
            players={state.players}
            game={state.game}
          />
        ) : state.phase === 'reveal' && state.game ? (
          <RevealPanel
            players={state.players}
            hostId={state.hostId}
            playerId={playerId}
            game={state.game}
          />
        ) : state.phase === 'ended' && state.game ? (
          <EndedPanel
            players={state.players}
            hostId={state.hostId}
            playerId={playerId}
            game={state.game}
          />
        ) : (
          <view className="card">
            <text className="muted">未知阶段</text>
          </view>
        )}
      </view>
    </scroll-view>
  )
}
