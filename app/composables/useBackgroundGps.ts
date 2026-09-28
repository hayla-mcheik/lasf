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
   * Initialize the native Background Geolocation SDK.
   *
   * We initialize it only once from the web application process.
   * The native Android service itself continues running in the
   * background after the WebView is no longer active.
   */
  const initializeBackgroundGps = async () => {
    if (!process.client) return
    if (!Capacitor.isNativePlatform()) return

    if (initialized) {
      return
    }

    // Prevent two simultaneous initialize() calls.
    if (initializing) {
      return initializing
    }

    initializing = (async () => {
      try {
        /**
         * Receive native GPS locations.
         *
         * This callback is mainly for debugging.
         * Laravel receives the actual location through HTTP.
         */
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

        /**
         * Receive HTTP upload result.
         */
        BackgroundGeolocation.onHttp((event) => {
          if (event.success) {
            console.log(
              '✅ GPS uploaded successfully:',
              event.status
            )
          } else {
            console.error(
              '❌ GPS upload failed:',
              {
                status: event.status,
                response: event.responseText
              }
            )
          }
        })

        /**
         * GPS provider status.
         */
        BackgroundGeolocation.onProviderChange((event) => {
          console.log('📡 GPS provider changed:', event)
        })

        /**
         * Configure Background Geolocation.
         */
        await BackgroundGeolocation.ready({
          geolocation: {
            /**
             * High accuracy GPS.
             */
            desiredAccuracy:
              BackgroundGeolocation.DesiredAccuracy.High,

            /**
             * Time-based updates.
             *
             * IMPORTANT:
             * locationUpdateInterval is only used when
             * distanceFilter = 0.
             */
            distanceFilter: 0,

            /**
             * Android desired update interval.
             * This is best-effort, not a strict guarantee.
             */
            locationUpdateInterval: 5000,

            fastestLocationUpdateInterval: 5000,

            /**
             * Do not automatically stop tracking when
             * the pilot becomes stationary.
             *
             * Checkout/pause explicitly stops GPS.
             */
            disableStopDetection: true,

            /**
             * Request background location permission.
             */
            locationAuthorizationRequest: 'Always',

            /**
             * iOS settings; harmless for Android.
             */
            pausesLocationUpdatesAutomatically: false,

            activityType:
              BackgroundGeolocation.ActivityType.Airborne
          },

          activity: {
            disableStopDetection: true
          },

          /**
           * Send GPS directly from the native service.
           *
           * Laravel route:
           * POST /api/gps/update
           */
          http: {
            url: `${config.public.apiBase}/gps/update`,

            method: 'POST',

            /**
             * Upload immediately after every location.
             */
            autoSync: true,

            /**
             * Send one location per request.
             */
            batchSync: false,

            /**
             * IMPORTANT:
             *
             * By default the plugin sends:
             *
             * {
             *   "location": {...}
             * }
             *
             * Laravel expects:
             *
             * {
             *   "latitude": ...,
             *   "longitude": ...,
             *   "accuracy": ...
             * }
             *
             * "." means the location object is placed
             * directly at the root.
             */
            rootProperty: '.',

            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },

            timeout: 30000
          },

          /**
           * Transform the native GPS object into exactly
           * what Laravel expects.
           */
          persistence: {
            locationTemplate: `{
              "latitude": <%= latitude %>,
              "longitude": <%= longitude %>,
              "accuracy": <%= accuracy %>
            }`,

            /**
             * Keep failed locations for a few days so
             * they can be retried when network returns.
             */
            maxDaysToPersist: 3
          },

          /**
           * Android application lifecycle.
           */
          app: {
            /**
             * Continue native tracking after the WebView/app
             * is terminated.
             */
            stopOnTerminate: false,

            /**
             * DO NOT automatically start GPS after reboot.
             *
             * GPS starts only after pilot check-in.
             */
            startOnBoot: false,

            /**
             * Android foreground-service notification.
             */
            notification: {
              title: 'LASF GPS Tracking',

              text:
                'Your GPS location is being tracked while you are flying.',

              channelName: 'LASF GPS Tracking'
            },

            /**
             * Android background permission explanation.
             */
            backgroundPermissionRationale: {
              title:
                'Allow LASF to access your location in the background?',

              message:
                'LASF needs background location access to continue tracking your position while you are flying, even when your phone screen is locked.',

              positiveAction: 'Allow',

              negativeAction: 'Cancel'
            }
          },

          /**
           * Debug logging during development.
           */
          logger: {
            debug: true,

            logLevel:
              BackgroundGeolocation.LogLevel.Verbose,

            logMaxDays: 3
          }
        })

        initialized = true
        isReady.value = true

        console.log('✅ Background GPS initialized')
      } catch (error) {
        console.error(
          '❌ Background GPS initialization failed:',
          error
        )

        throw error
      } finally {
        initializing = null
      }
    })()

    return initializing
  }

  /**
   * Start GPS after successful pilot check-in.
   */
  const startBackgroundGps = async (token: string) => {
    if (!process.client) return false

    if (!Capacitor.isNativePlatform()) {
      console.log(
        '🌐 Browser mode: native GPS disabled.'
      )

      return false
    }

    if (!token) {
      console.error(
        '❌ No authentication token. GPS cannot start.'
      )

      return false
    }

    try {
      /**
       * Initialize SDK first.
       */
      await initializeBackgroundGps()

      /**
       * Update Sanctum token.
       *
       * This is important because Laravel protects
       * /api/gps/update with auth:sanctum.
       */
      await BackgroundGeolocation.setConfig({
        http: {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      })

      /**
       * Ask for location permission.
       */
      const permissionStatus =
        await BackgroundGeolocation.requestPermission()

      console.log(
        '📍 Background GPS permission:',
        permissionStatus
      )

      /**
       * Check current native tracking state.
       */
      const currentState =
        await BackgroundGeolocation.getState()

      console.log(
        '📡 Current GPS state:',
        currentState.enabled
      )

      /**
       * Don't start twice.
       */
      if (!currentState.enabled) {
        await BackgroundGeolocation.start()

        console.log(
          '🚀 Native background GPS STARTED'
        )
      } else {
        console.log(
          'ℹ️ Native background GPS is already running'
        )
      }

      isTracking.value = true

      return true
    } catch (error) {
      console.error(
        '❌ Failed to start background GPS:',
        error
      )

      return false
    }
  }

  /**
   * Stop GPS after pause or checkout.
   */
  const stopBackgroundGps = async () => {
    if (!process.client) return

    if (!Capacitor.isNativePlatform()) {
      return
    }

    try {
      const state =
        await BackgroundGeolocation.getState()

      if (state.enabled) {
        await BackgroundGeolocation.stop()
      }

      isTracking.value = false

      console.log(
        '🛑 Native background GPS STOPPED'
      )
    } catch (error) {
      console.error(
        '❌ Failed to stop background GPS:',
        error
      )
    }
  }

  /**
   * Get native GPS state.
   */
  const getTrackingState = async () => {
    if (!process.client) return false

    if (!Capacitor.isNativePlatform()) {
      return false
    }

    try {
      const state =
        await BackgroundGeolocation.getState()

      isTracking.value = state.enabled

      return state.enabled
    } catch (error) {
      console.error(
        '❌ Failed to get GPS state:',
        error
      )

      return false
    }
  }

  /**
   * Number of locations waiting for upload.
   */
  const getPendingLocations = async () => {
    if (!process.client) return 0

    if (!Capacitor.isNativePlatform()) {
      return 0
    }

    try {
      return await BackgroundGeolocation.getCount()
    } catch (error) {
      console.error(
        '❌ Failed to get pending GPS locations:',
        error
      )

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