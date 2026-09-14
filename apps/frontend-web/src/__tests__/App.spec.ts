import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'

import App from '../App.vue'
import HomeView from '../views/HomeView.vue'

describe('App', () => {
  it('renders home view at /', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/', component: HomeView }],
    })
    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
      },
    })

    expect(wrapper.text()).toContain('歌词猜猜猜')
  })
})
