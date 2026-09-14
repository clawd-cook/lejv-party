import { useCallback, useEffect } from '@lynx-js/react'
import { Button, ScrollView } from '@lynx-js/lynx-ui'

import { openScheme } from '../../lib/navigation.js'

import './App.css'

export function App(props: { onMounted?: () => void }) {
  const secondPageScheme =
    'hybrid://lynxview_page?bundle=second.lynx.bundle&title=Second%20Page&screen_orientation=portrait'

  useEffect(() => {
    props.onMounted?.()
  }, [props])

  const openSecondPage = useCallback(() => {
    void openScheme(secondPageScheme)
  }, [secondPageScheme])

  return (
    <view className="luna-light page-root">
      <ScrollView className="page-scroll" scrollOrientation="vertical">
        <view className="app">
          <view className="hero">
            <text className="eyebrow">LEJV Party · Debug</text>
            <text className="title">main placeholder</text>
            <text className="subtitle">
              Cold start opens home. This bundle is kept for debug routes only.
            </text>
          </view>
          <view className="card">
            <text className="card__title">Optional debug</text>
            <text className="muted">Open the second page bundle.</text>
            <Button className="btn" onClick={openSecondPage}>
              <text className="btn__text">Open second page</text>
            </Button>
          </view>
        </view>
      </ScrollView>
    </view>
  )
}
