import { useBackgroundGps } from "~/composables/useBackgroundGps"

export default defineNuxtPlugin(() => {
  const gps = useBackgroundGps()

  gps.initializeBackgroundGps().catch((error) => {
    console.error('Background GPS initialization failed:', error)
  })
})
