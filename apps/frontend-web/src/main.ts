import { configureApiClient } from '@lejv-party/api-client'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import './assets/main.css'
import router from './router'

configureApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
})

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
