import '@testing-library/jest-dom'
import { beforeEach, expect, test, vi } from 'vitest'
import { render, getQueriesForElement } from '@lynx-js/react/testing-library'
import { subscribeRoomEvents } from '@lejv-party/api-client'

import { App } from '../App.js'

vi.mock('@lejv-party/api-client', () => ({
  subscribeRoomEvents: vi.fn(() => ({ close: vi.fn() })),
  configureApiClient: vi.fn(),
}))
beforeEach(() => {
  vi.clearAllMocks()
})

vi.mock('@lejv-party/client-core', async () => {
  const actual = await vi.importActual<typeof import('@lejv-party/client-core')>(
    '@lejv-party/client-core',
  )
  return {
    ...actual,
    loadPlayerId: vi.fn(() => null),
    savePlayerId: vi.fn(),
  }
})

test('Room shows missing-params message without route query', async () => {
  const onMounted = vi.fn()

  render(<App onMounted={onMounted} />)

  expect(onMounted).toBeCalledTimes(1)
  expect(subscribeRoomEvents).not.toHaveBeenCalled()

  const { findByText } = getQueriesForElement(elementTree.root!)
  expect(await findByText('无法进入房间')).toBeInTheDocument()
})

test('Room subscribes with fetch SSE when route params present', async () => {
  const prev = lynx.__globalProps
  lynx.__globalProps = {
    ...prev,
    roomId: 'ABC123',
    playerId: 'player-1',
  }

  try {
    render(<App />)

    expect(subscribeRoomEvents).toHaveBeenCalledWith(
      'ABC123',
      'player-1',
      expect.any(Function),
      { transport: 'fetch' },
    )
  } finally {
    lynx.__globalProps = prev
  }
})
