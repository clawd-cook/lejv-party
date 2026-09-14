import { useCallback, useEffect } from '@lynx-js/react'
import { Button } from '@lynx-js/lynx-ui'
import { close } from 'sparkling-navigation'

import './App.css'

export function App(props: { onMounted?: () => void }) {
  useEffect(() => {
    props.onMounted?.()
  }, [props])

  const onClose = useCallback(() => {
    close()
  }, [])

  return (
    <view className="luna-light page-root">
      <view className="app">
        <view className="hero">
          <text className="eyebrow">LEJV Party · Debug</text>
          <text className="title">second placeholder</text>
          <text className="subtitle">Minimal lynx-ui debug shell.</text>
        </view>
        <view className="card">
          <Button className="btn btn--secondary" onClick={onClose}>
            <text className="btn__text">Close</text>
          </Button>
        </view>
      </view>
    </view>
  )
}
