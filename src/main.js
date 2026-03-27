import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/authStore'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Restore auth state from sessionStorage before mounting
// so the navigation guard has token + role available on first load
const authStore = useAuthStore()
authStore.initializeFromStorage()

app.mount('#app')
