import '@testing-library/jest-dom'
import { expect, test, vi } from 'vitest'
import { render, getQueriesForElement } from '@lynx-js/react/testing-library'

import { App } from '../App.js'

vi.mock('sparkling-navigation', () => ({ open: vi.fn() }))

test('App renders main placeholder', async () => {
  const onMounted = vi.fn()

  render(<App onMounted={onMounted} />)

  expect(onMounted).toBeCalledTimes(1)

  const { findByText } = getQueriesForElement(elementTree.root!)
  const title = await findByText('main placeholder')
  expect(title).toBeInTheDocument()
})
