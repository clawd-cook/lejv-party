import '@testing-library/jest-dom'
import { expect, test, vi } from 'vitest'
import { render, getQueriesForElement } from '@lynx-js/react/testing-library'

import { App } from '../App.js'

vi.mock('sparkling-navigation', () => ({ open: vi.fn() }))
vi.mock('@lejv-party/api-client', () => ({
  createRoom: vi.fn(),
  joinRoom: vi.fn(),
  ApiRequestError: class ApiRequestError extends Error {},
  configureApiClient: vi.fn(),
}))
vi.mock('@lejv-party/client-core', () => ({
  mapApiErrorBody: vi.fn(() => 'error'),
  savePlayerId: vi.fn(),
}))

test('Home renders create and join cards', async () => {
  const onMounted = vi.fn()

  render(<App onMounted={onMounted} />)

  expect(onMounted).toBeCalledTimes(1)

  const { findByText } = getQueriesForElement(elementTree.root!)
  expect(await findByText('歌词猜猜猜')).toBeInTheDocument()
  expect(await findByText('创建房间')).toBeInTheDocument()
  expect(await findByText('加入房间')).toBeInTheDocument()
})
