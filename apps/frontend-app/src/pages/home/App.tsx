import { useCallback, useEffect, useState } from '@lynx-js/react'
import {
  ApiRequestError,
  createRoom,
  joinRoom,
} from '@lejv-party/api-client'
import { mapApiErrorBody, savePlayerId } from '@lejv-party/client-core'
import { Button, Input, ScrollView } from '@lynx-js/lynx-ui'
import * as router from 'sparkling-navigation'

import { ensureApiClientConfigured } from '../../lib/api.js'
import { buildRoomScheme } from '../../lib/room-params.js'

import './App.css'

function validateNickname(raw: string): string | null {
  const trimmed = raw.trim()
  if (trimmed.length === 0 || trimmed.length > 16) return null
  return trimmed
}

export function App(props: { onMounted?: () => void }) {
  const [createNickname, setCreateNickname] = useState('')
  const [joinNickname, setJoinNickname] = useState('')
  const [joinRoomId, setJoinRoomId] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    ensureApiClientConfigured()
    props.onMounted?.()
  }, [props])

  const openRoom = useCallback((roomId: string, playerId: string) => {
    savePlayerId(roomId, playerId)
    router.open({ scheme: buildRoomScheme(roomId, playerId) })
  }, [])

  const onCreate = useCallback(() => {
    setCreateError(null)
    const nickname = validateNickname(createNickname)
    if (!nickname) {
      setCreateError('昵称需 1-16 个字符')
      return
    }
    if (creating) return

    setCreating(true)
    ensureApiClientConfigured()
    void createRoom(nickname)
      .then((result) => {
        openRoom(result.roomId, result.playerId)
      })
      .catch((err: unknown) => {
        if (err instanceof ApiRequestError) {
          setCreateError(mapApiErrorBody(err.body))
        } else {
          setCreateError('创建房间失败，请重试')
        }
      })
      .finally(() => {
        setCreating(false)
      })
  }, [createNickname, creating, openRoom])

  const onJoin = useCallback(() => {
    setJoinError(null)
    const nickname = validateNickname(joinNickname)
    if (!nickname) {
      setJoinError('昵称需 1-16 个字符')
      return
    }

    const roomId = joinRoomId.trim().toUpperCase()
    if (!/^[A-Z0-9]{6}$/.test(roomId)) {
      setJoinError('房间号需为 6 位字母/数字')
      return
    }
    if (joining) return

    setJoining(true)
    ensureApiClientConfigured()
    void joinRoom(roomId, nickname)
      .then((result) => {
        openRoom(roomId, result.playerId)
      })
      .catch((err: unknown) => {
        if (err instanceof ApiRequestError) {
          setJoinError(mapApiErrorBody(err.body))
        } else {
          setJoinError('加入房间失败，请重试')
        }
      })
      .finally(() => {
        setJoining(false)
      })
  }, [joinNickname, joinRoomId, joining, openRoom])

  return (
    <view className="luna-light page-root">
      <ScrollView className="page-scroll" scrollOrientation="vertical">
        <view className="app">
          <view className="hero">
            <text className="eyebrow">LEJV Party · Lynx</text>
            <text className="title">歌词猜猜猜</text>
            <text className="subtitle">英译中，抢答歌名，派对小游戏</text>
          </view>

          <view className="card">
            <view className="card__header">
              <text className="card__title">创建房间</text>
              <text className="card__tag">Host</text>
            </view>
            <view className="field">
              <text className="label">昵称</text>
              <Input
                className="input"
                placeholder="1-16 字符"
                maxLength={16}
                value={createNickname}
                onInput={setCreateNickname}
              />
            </view>
            <Button
              className="btn"
              disabled={creating}
              onClick={onCreate}
            >
              <text className="btn__text">
                {creating ? '创建中…' : '创建'}
              </text>
            </Button>
            {createError ? <text className="error">{createError}</text> : null}
          </view>

          <view className="card">
            <view className="card__header">
              <text className="card__title">加入房间</text>
              <text className="card__tag card__tag--outline">Join</text>
            </view>
            <view className="field">
              <text className="label">昵称</text>
              <Input
                className="input"
                placeholder="1-16 字符"
                maxLength={16}
                value={joinNickname}
                onInput={setJoinNickname}
              />
            </view>
            <view className="field">
              <text className="label">房间号</text>
              <Input
                className="input"
                placeholder="6 位字母/数字"
                maxLength={6}
                value={joinRoomId}
                onInput={setJoinRoomId}
              />
            </view>
            <Button
              className="btn"
              disabled={joining}
              onClick={onJoin}
            >
              <text className="btn__text">
                {joining ? '加入中…' : '加入'}
              </text>
            </Button>
            {joinError ? <text className="error">{joinError}</text> : null}
          </view>
        </view>
      </ScrollView>
    </view>
  )
}
