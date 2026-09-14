import { vi } from 'vitest'
import type { ReactNode } from '@lynx-js/react'

type ButtonMockProps = {
  children?: ReactNode | ((state: { active: boolean; disabled: boolean }) => ReactNode)
  onClick?: () => void
  disabled?: boolean
  className?: string
}

type InputMockProps = {
  className?: string
  placeholder?: string
  maxLength?: number
  value?: string
  defaultValue?: string
  readonly?: boolean
  onInput?: (value: string) => void
}

type ScrollViewMockProps = {
  children?: ReactNode
  className?: string
  scrollOrientation?: 'vertical' | 'horizontal'
}

type PassthroughProps = {
  children?: ReactNode
  className?: string
  as?: 'View' | 'ScrollView'
  scrollOrientation?: 'vertical' | 'horizontal'
  offset?: number
  androidStatusBarPlusBottomBarHeight?: number
}

vi.mock('@lynx-js/lynx-ui', () => ({
  Button: (props: ButtonMockProps) => {
    const content =
      typeof props.children === 'function'
        ? props.children({ active: false, disabled: !!props.disabled })
        : props.children
    return (
      <view
        className={props.className}
        bindtap={() => {
          if (!props.disabled) props.onClick?.()
        }}
      >
        {content}
      </view>
    )
  },
  Input: (props: InputMockProps) => (
    <input
      className={props.className}
      placeholder={props.placeholder}
      maxlength={props.maxLength}
      // Only set value when controlled; defaultValue alone must stay uncontrolled.
      {...(props.value !== undefined
        ? { value: props.value }
        : props.defaultValue !== undefined
          ? { value: props.defaultValue }
          : {})}
      disabled={props.readonly}
      bindinput={(e) => props.onInput?.(e.detail.value)}
    />
  ),
  ScrollView: (props: ScrollViewMockProps) => (
    <scroll-view
      className={props.className}
      scroll-orientation={props.scrollOrientation}
    >
      {props.children}
    </scroll-view>
  ),
  KeyboardAwareRoot: (props: PassthroughProps) => (
    <view className={props.className}>{props.children}</view>
  ),
  KeyboardAwareTrigger: (props: PassthroughProps) => (
    <view className={props.className}>{props.children}</view>
  ),
  KeyboardAwareResponder: (props: PassthroughProps) =>
    props.as === 'ScrollView' ? (
      <scroll-view
        className={props.className}
        scroll-orientation={props.scrollOrientation}
      >
        {props.children}
      </scroll-view>
    ) : (
      <view className={props.className}>{props.children}</view>
    ),
}))
