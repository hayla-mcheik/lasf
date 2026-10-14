import { ref } from 'vue'
import BackgroundGeolocation from '@transistorsoft/capacitor-background-geolocation'
import { Capacitor } from '@capacitor/core'
 
const isTracking = ref(false)
const isReady = ref(false)
 
/**
 * 'always'       -> works with the phone locked (what we need)
 * 'when_in_use'  -> stops when the phone locks / app is backgrounded
 * 'denied'       -> no location at all
 * 'unknown'      -> not checked yet / web
 */
const locationPermission = ref<'always' | 'when_in_use' | 'denied' | 'unknown'>('unknown')
 
let initialized = false
let initializing: Promise<void> | null = null
 
export const useBackgroundGps = () => {
  const config = useRuntimeConfig()
 
  /**
   * Initialize the native Background Geolocation SDK (once).
   */
  const initializeBackgroundGps = async () => {
    if (!process.client) return
    if (!Capacitor.isNativePlatform()) return
 
    if (initialized) return
 
    // Prevent two simultaneous ready() calls.
    if (initializing) return initializing
 
    initializing = (async () => {
      try {
BackgroundGeolocation.onLocation(
  async (location) => {

    console.log('📍 LOCATION RECEIVED')

    console.log({
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      accuracy: location.coords.accuracy,
      speed: location.coords.speed,
      heading: location.coords.heading,
      timestamp: location.timestamp
    })

    try {
      const provider =
        await BackgroundGeolocation.getProviderState()

      const state =
        await BackgroundGeolocation.getState()

      console.log('📡 PROVIDER:', provider)

      console.log('📡 STATE:', {
        enabled: state.enabled,
        isMoving: state.isMoving
      })
    } catch (e) {
      console.error(e)
    }
  },

  (error) => {
    console.error('❌ Native GPS error:', error)
  }
)
        BackgroundGeolocation.onHttp((event) => {
          if (event.success) {
   console.log('✅ GPS uploaded successfully:', {
  status: event.status,
  success: event.success
})
          } else {
            console.error('❌ GPS upload failed:', {
              status: event.status,
              response: event.responseText
            })
 
            /**
             * The server says there is no active flight session
             * (expired after 7 hours, closed, or paused elsewhere).
             * Stop the native GPS by itself so it does not keep
             * running and draining the battery, and drop the
             * queued points that can never be accepted.
             */
            const body = String(event.responseText || '')
 
            if (
              event.status === 422 &&
              body.includes('No active flight session')
            ) {
              console.warn('🛑 No active session on server: stopping GPS')
 
              BackgroundGeolocation.stop()
                .then(() => BackgroundGeolocation.destroyLocations())
                .catch((e) => console.error('Stop after expiry failed:', e))
 
              isTracking.value = false
            }
          }
        })
 
        BackgroundGeolocation.onProviderChange((event) => {
          console.log('📡 GPS provider changed:', event)
        })
 
        BackgroundGeolocation.onMotionChange((event) => {
          console.log('🏃 Motion change. isMoving =', event.isMoving)
        })
 
        /**
         * HEARTBEAT
         * Fires every `heartbeatInterval` seconds even when the pilot
         * is standing still. We take one fresh position and persist it,
         * so the dashboard never shows a still-flying pilot as "old".
         */
        BackgroundGeolocation.onHeartbeat(async () => {
          try {
            await BackgroundGeolocation.getCurrentPosition({
              samples: 1,
              persist: true,
              timeout: 30,
              maximumAge: 0
            })
          } catch (e) {
            console.error('❌ Heartbeat position failed:', e)
          }
        })
 
        await BackgroundGeolocation.ready({
   geolocation: {
  desiredAccuracy:
  BackgroundGeolocation.DesiredAccuracy.High,

  distanceFilter: 0,

  locationUpdateInterval: 5000,

  fastestLocationUpdateInterval: 5000,

  locationAuthorizationRequest: 'Always',

  pausesLocationUpdatesAutomatically: false,

  useSignificantChangesOnly: false
},
 
          // disableStopDetection belongs ONLY here, not in geolocation.
activity: {
  disableStopDetection: true,
},
 
          http: {
            url: `${config.public.apiBase}/gps/update`,
            method: 'POST',
            autoSync: true,
            batchSync: false,
 
            // Put the location fields at the JSON root (Laravel expects this)
            rootProperty: '.',
 
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
 
            timeout: 30000
          },
 
          persistence: {
            locationTemplate: `{
              "latitude": <%= latitude %>,
              "longitude": <%= longitude %>,
              "accuracy": <%= accuracy %>
            }`,
            maxDaysToPersist: 3
          },
 
          app: {
            stopOnTerminate: false,
            startOnBoot: false,
 
            // iOS: keep the app running while the phone is locked
            preventSuspend: true,
 
            // Seconds. Wakes the app periodically (see onHeartbeat above)
            heartbeatInterval: 60,
 
            notification: {
              title: 'LASF GPS Tracking',
              text: 'Your GPS location is being tracked while you are flying.',
              channelName: 'LASF GPS Tracking'
            },
 
            backgroundPermissionRationale: {
              title: 'Allow LASF to access your location in the background?',
              message:
                'LASF needs background location access to continue tracking your position while you are flying, even when your phone screen is locked.',
              positiveAction: 'Allow',
              negativeAction: 'Cancel'
            }
          },
 
          logger: {
            debug: true,
            logLevel: BackgroundGeolocation.LogLevel.Verbose,
            logMaxDays: 3
          }
        })
 
        initialized = true
        isReady.value = true
 
        console.log('✅ Background GPS initialized')
      } catch (error) {
        console.error('❌ Background GPS initialization failed:', error)
        throw error
      } finally {
        initializing = null
      }
    })()
 
    return initializing
  }
 
  /**
   * Read the real authorization level from the OS.
   * Status numbers: 2 = denied, 3 = Always, 4 = When In Use.
   */
const refreshPermissionLevel = async () => {
  try {
    const provider = await BackgroundGeolocation.getProviderState()

    console.log(
      '🔐 PROVIDER STATE',
      JSON.stringify(provider, null, 2)
    )

    switch (provider.status) {
      case 3:
        locationPermission.value = 'always'
        break

      case 4:
        locationPermission.value = 'when_in_use'
        break

      case 1:
      case 2:
        locationPermission.value = 'denied'
        break

      default:
        locationPermission.value = 'unknown'
    }

    console.log(
      '🔐 Location permission:',
      locationPermission.value
    )

  } catch (e) {
    console.error('❌ Could not read provider state:', e)
    locationPermission.value = 'unknown'
  }

  return locationPermission.value
}
 
  /**
   * Start GPS after a successful pilot check-in (or resume).
   * Returns true only if tracking is really running.
   *
   * After it returns, check `locationPermission.value`:
   * if it is 'when_in_use', tracking works only while the app is open.
   */
  const startBackgroundGps = async (token: string): Promise<boolean> => {
    if (!process.client) return false
 
    if (!Capacitor.isNativePlatform()) {
      console.log('🔴 GPS STOPPED: not a native platform')
      return false
    }
 
    if (!token) {
      console.log('🔴 GPS STOPPED: no token')
      return false
    }
 
    try {
      await initializeBackgroundGps()
 
      // Always refresh the token (it may have changed since last start)
      await BackgroundGeolocation.setConfig({
        http: {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      })
 
      const permissionStatus = await BackgroundGeolocation.requestPermission()
      console.log('🟢 GPS PERMISSION RESULT:', permissionStatus)
 
      const level = await refreshPermissionLevel()
 
      if (level === 'denied') {
        isTracking.value = false
        return false
      }
 
      const currentState = await BackgroundGeolocation.getState()
 
if (!currentState.enabled) {
  await BackgroundGeolocation.start()

  console.log('🟢 GPS start() finished')
} else {
  console.log('🟢 GPS was already running')
}

await BackgroundGeolocation.changePace(true)

console.log('🏃 Forced moving mode')
      const finalState = await BackgroundGeolocation.getState()
      isTracking.value = !!finalState.enabled
 
      return !!finalState.enabled
    } catch (error) {
      console.error('🔴 GPS START ERROR:', error)
      isTracking.value = false
      return false
    }
  }
 
  /**
   * Stop GPS after pause or checkout.
   */
  const stopBackgroundGps = async () => {
    if (!process.client) return
    if (!Capacitor.isNativePlatform()) return
 
    try {
      const state = await BackgroundGeolocation.getState()
 
      if (state.enabled) {
        await BackgroundGeolocation.stop()
      }
 
      isTracking.value = false
      console.log('🛑 Native background GPS STOPPED')
    } catch (error) {
      console.error('❌ Failed to stop background GPS:', error)
    }
  }
 
  const getTrackingState = async () => {
    if (!process.client) return false
    if (!Capacitor.isNativePlatform()) return false
 
    try {
      const state = await BackgroundGeolocation.getState()
      isTracking.value = state.enabled
      return state.enabled
    } catch (error) {
      console.error('❌ Failed to get GPS state:', error)
      return false
    }
  }
 
  const getPendingLocations = async () => {
    if (!process.client) return 0
    if (!Capacitor.isNativePlatform()) return 0
 
    try {
      return await BackgroundGeolocation.getCount()
    } catch (error) {
      console.error('❌ Failed to get pending GPS locations:', error)
      return 0
    }
  }
 
  return {
    isTracking,
    isReady,
    locationPermission,
 
    initializeBackgroundGps,
    startBackgroundGps,
    stopBackgroundGps,
    getTrackingState,
    getPendingLocations,
    refreshPermissionLevel
  }
}
 