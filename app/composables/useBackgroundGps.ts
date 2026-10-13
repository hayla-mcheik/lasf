import { ref } from 'vue'
import BackgroundGeolocation from '@transistorsoft/capacitor-background-geolocation'
import { Capacitor } from '@capacitor/core'
 
const isTracking = ref(false)
const isReady = ref(false)
 
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
          (location) => {
            console.log('📍 Native GPS location:', {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: location.coords.accuracy,
              timestamp: location.timestamp
            })
          },
          (error) => {
            console.error('❌ Native GPS error:', error)
          }
        )
 
        BackgroundGeolocation.onHttp((event) => {
          if (event.success) {
            console.log('✅ GPS uploaded successfully:', event.status)
          } else {
            console.error('❌ GPS upload failed:', {
              status: event.status,
              response: event.responseText
            })
          }
        })
 
        BackgroundGeolocation.onProviderChange((event) => {
          console.log('📡 GPS provider changed:', event)
        })
 
        // Log when the plugin switches between moving / stationary.
        BackgroundGeolocation.onMotionChange((event) => {
          console.log('🏃 Motion change. isMoving =', event.isMoving)
        })
 
        await BackgroundGeolocation.ready({
          geolocation: {
            desiredAccuracy: BackgroundGeolocation.DesiredAccuracy.High,
 
            // distanceFilter = 0 -> time based updates
            distanceFilter: 0,
 
            locationUpdateInterval: 5000,
            fastestLocationUpdateInterval: 5000,
 
            locationAuthorizationRequest: 'Always',
 
            // iOS only; harmless on Android
            pausesLocationUpdatesAutomatically: false
          },
 
          // NOTE: disableStopDetection belongs ONLY here, not in geolocation.
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
   * Start GPS after a successful pilot check-in (or resume).
   * Returns true only if tracking is really running.
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
 
      const currentState = await BackgroundGeolocation.getState()
 
      if (!currentState.enabled) {
        await BackgroundGeolocation.start()
        console.log('🟢 GPS start() finished')
      } else {
        console.log('🟢 GPS was already running')
      }
 
      /**
       * IMPORTANT FIX:
       * The plugin starts in "stationary" mode and sends only ONE point
       * until the motion sensors detect movement. changePace(true) forces
       * the "moving" state so it records every 5 seconds even if the
       * phone is still.
       */
      await BackgroundGeolocation.changePace(true)
      console.log('🟢 GPS changePace(true) done')
 
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
 
    initializeBackgroundGps,
    startBackgroundGps,
    stopBackgroundGps,
    getTrackingState,
    getPendingLocations
  }
}
 