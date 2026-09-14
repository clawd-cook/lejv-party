import { useCallback, useEffect, useState } from '@lynx-js/react'
import * as router from 'sparkling-navigation'

import './App.css'
import sparklingLogo from '../../assets/sparkling_icon.png'
import { buildHomeScheme } from '../../lib/room-params.js'

export function App(props: { onMounted?: () => void }) {
  const [lastResult, setLastResult] = useState<string | null>(null)
  const homeScheme = buildHomeScheme()
  const secondPageScheme =
    'hybrid://lynxview_page?bundle=second.lynx.bundle&title=Second%20Page&screen_orientation=portrait'

  useEffect(() => {
    console.info('Hello, Sparkling template')
    props.onMounted?.()
  }, [props])

  const openWithScheme = useCallback((targetScheme: string) => {
    router.open(
      { scheme: targetScheme },
      (result: router.OpenResponse) => {
        setLastResult(JSON.stringify(result))
      },
    )
  }, [])

  const openHome = useCallback(() => {
    openWithScheme(homeScheme)
  }, [homeScheme, openWithScheme])

  const openSecondPage = useCallback(() => {
    openWithScheme(secondPageScheme)
  }, [openWithScheme, secondPageScheme])

  return (
    <scroll-view className="page-scroll" scroll-orientation="vertical">
      <view className="app">
        <view className="hero">
          <text className="eyebrow">Sparkling · LynxJS</text>
          <image src={sparklingLogo} className="logo" />
          <text className="title">Sparkling Starter</text>
        </view>
        <view className="card">
          <view className="card__header">
            <text className="card__title">歌词猜猜猜</text>
            <text className="card__tag">Party</text>
          </view>
          <text className="label">打开派对首页</text>
          <text className="pill pill--mono">{homeScheme}</text>
          <view className="primary" bindtap={openHome}>
            <text className="primary__text">进入首页</text>
            <text className="primary__icon">→</text>
          </view>
          {lastResult ? (
            <text className="result">{lastResult}</text>
          ) : null}
        </view>
        <view className="card">
          <view className="card__header">
            <text className="card__title">Multi page demo</text>
            <text className="card__tag card__tag--outline">Router</text>
          </view>
          <text className="label">Scheme</text>
          <text className="pill pill--mono">{secondPageScheme}</text>
          <view className="primary" bindtap={openSecondPage}>
            <text className="primary__text">Open second page</text>
            <text className="primary__icon">→</text>
          </view>
        </view>
      </view>
    </scroll-view>
  )
}
