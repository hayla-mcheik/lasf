// plugins/hydrate-auth.server.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async (nuxtApp) => {
  const auth = useAuthStore()
  
  // Only run on the server side
  if (process.server) {
    const cookie = useCookie('auth') // 'auth' is the name of your store/cookie
    
    if (cookie.value) {
      // Manually sync the cookie value into the Pinia state
      // The persistedstate plugin stores data as a JSON string
      const data = typeof cookie.value === 'string' 
        ? JSON.parse(cookie.value) 
        : cookie.value

      auth.$patch({
        user: data.user,
        token: data.token
      })
    }
  }
})