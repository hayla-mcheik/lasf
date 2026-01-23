// /plugins/jquery.client.ts
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  // We don't load scripts here anymore because they are in nuxt.config.ts
  // This just ensures that if you need 'window.$', it's handled safely
  if (process.client) {
    console.log('jQuery plugins initialized via nuxt.config.ts')
  }
})