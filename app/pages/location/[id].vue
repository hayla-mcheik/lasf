<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from '#app'
import { Capacitor } from '@capacitor/core'
import Breadcrumbs from '~/components/Frontend/Breadcrumbs.vue'
import { useAuthStore } from '~/stores/auth'
import { useCrossCountryStore } from '~/stores/crossCountry'
import { useBackgroundGps } from '~/composables/useBackgroundGps'
 
const {
    startBackgroundGps,
    stopBackgroundGps,
    locationPermission
} = useBackgroundGps()
/*
|--------------------------------------------------------------------------
| Stores
|--------------------------------------------------------------------------
*/
 
const authStore = useAuthStore()
const crossCountryStore = useCrossCountryStore()
 
const config = useRuntimeConfig()
const route = useRoute()
 
const GPS_WARNING =
    'GPS tracking is NOT active.\n\n' +
    'Please:\n' +
    '1. Use the LASF mobile app (not the browser)\n' +
    '2. Set Location permission to "Allow all the time"\n' +
    '3. Turn off battery optimization for LASF\n\n' +
    'Then press "Restart GPS".'
 
/*
|--------------------------------------------------------------------------
| Load Location
|--------------------------------------------------------------------------
*/
 
const {
    data: location,
    pending,
    error: locationError,
    refresh: refreshLocation
} = await useFetch(
    () => `${config.public.apiBase}/flying-locations/${route.params.slug || route.params.id}`,
    {
        key: `location-${route.params.slug || route.params.id}`,
        immediate: true,
        transform: (response) => response.data || response
    }
)
 
/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/
 
const checkingIn = ref(false)
 
// null = unknown, true = running, false = failed to start
const gpsActive = ref(null)
 
const currentRequest = computed(() => crossCountryStore.currentRequest)
const crossCountrySession = computed(() => crossCountryStore.activeSession)
const hasCrossCountry = computed(() => crossCountryStore.hasRequest)
const isPending = computed(() => crossCountryStore.isPending)
const isApproved = computed(() => crossCountryStore.isApproved)
const isClosed = computed(() => crossCountryStore.isClosed)
const isCancelled = computed(() => crossCountryStore.isCancelled)
 
/*
|--------------------------------------------------------------------------
| Server dates
|--------------------------------------------------------------------------
|
| Laravel sends checked_in_at / expires_at as "2026-10-14 06:59:50"
| (UTC, no timezone). new Date() would read that as the PHONE's local
| time and be off by hours, so we mark it as UTC first.
|
*/
 
function parseServerDate(value) {
    if (!value) return null
 
    if (value instanceof Date) return value
 
    let text = String(value)
 
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(text)) {
        text = text.replace(' ', 'T') + 'Z'
    }
 
    const date = new Date(text)
 
    return isNaN(date.getTime()) ? null : date
}
 
function formatTime(value) {
    const date = parseServerDate(value)
 
    if (!date) return '-'
 
    return date.toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short'
    })
}
 
/*
|--------------------------------------------------------------------------
| Airspace Session
|--------------------------------------------------------------------------
*/
 
const activeSession = computed(() => authStore.activeSession)
 
const isFlyingHere = computed(() => {
    if (!location.value) return false
 
    const sessionLocationId =
        activeSession.value?.flying_location_id ||
        activeSession.value?.location?.id ||
        null
 
    return Number(sessionLocationId) === Number(location.value.id)
})
 
/*
|--------------------------------------------------------------------------
| Session expiry (7 hours)
|--------------------------------------------------------------------------
*/
 
// Updated every few seconds so the countdown and expiry check stay live.
const now = ref(Date.now())
 
const expiresAtMs = computed(() => {
    const date = parseServerDate(activeSession.value?.expires_at)
 
    return date ? date.getTime() : null
})
 
const remainingLabel = computed(() => {
    if (!expiresAtMs.value) return '-'
 
    const diff = expiresAtMs.value - now.value
 
    if (diff <= 0) return 'Expired'
 
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
 
    return `${hours}h ${minutes}m`
})
 
let expiryTimer = null
let handlingExpiry = false
 
/**
 * The phone thinks the session has expired. Ask the SERVER first
 * (it is the source of truth), then stop GPS and clear the screen.
 */
async function handleSessionExpired() {
    if (handlingExpiry) return
 
    handlingExpiry = true
 
    try {
        let fresh = null
 
        try {
            fresh = await $fetch(
                `${config.public.apiBase}/airspace-sessions/active-pilot`,
                {
                    headers: {
                        Authorization: `Bearer ${authStore.token}`
                    }
                }
            )
        } catch (e) {
            // No internet: try again on the next tick.
            console.warn('Expiry check: could not reach server', e)
            return
        }
 
        // Server still says the session is alive (phone clock is ahead?)
        if (fresh && fresh.id) {
            authStore.activeSession = fresh
            return
        }
 
        // Session is really over -> stop GPS and clear everything.
        await stopTracking()
 
        authStore.activeSession = null
 
        await Promise.allSettled([
            crossCountryStore.refresh(),
            refreshLocation()
        ])
 
        alert(
            'Your 7-hour flying session has expired and you were checked out automatically.\n\n' +
            'Scan the QR code again to start a new session.'
        )
    } finally {
        handlingExpiry = false
    }
}
 
function checkExpiry() {
    now.value = Date.now()
 
    if (!activeSession.value) return
    if (!expiresAtMs.value) return
 
    if (now.value >= expiresAtMs.value) {
        handleSessionExpired()
    }
}
 
// Timers are paused while the app is in the background, so also check
// the moment the pilot comes back to the app.
function onVisibilityChange() {
    if (document.visibilityState === 'visible') {
        checkExpiry()
    }
}
 
/*
|--------------------------------------------------------------------------
| Cross Country Helpers
|--------------------------------------------------------------------------
*/
 
const canCreateCrossCountry = computed(() => {
    return !hasCrossCountry.value || isClosed.value || isCancelled.value
})
 
const canStartCrossCountry = computed(() => {
    return hasCrossCountry.value && isApproved.value && !crossCountrySession.value
})
 
const canContinueCrossCountry = computed(() => {
    return !!crossCountrySession.value
})
 
const canCheckIn = computed(() => {
    return location.value?.status_label === 'green'
})
 
/*
|--------------------------------------------------------------------------
| GPS Tracking
|--------------------------------------------------------------------------
*/
 
async function startTracking() {
    if (!authStore.token) {
        console.error('❌ No authentication token.')
        gpsActive.value = false
        return false
    }
 
    console.log('🚀 Starting native background GPS...')
 
    const ok = await startBackgroundGps(authStore.token)
 
    gpsActive.value = ok
 
    return ok
}
 
async function stopTracking() {
    console.log('🛑 Stopping native background GPS...')
 
    await stopBackgroundGps()
 
    gpsActive.value = null
}
 
async function handleRestartGps() {
    const ok = await startTracking()
 
    if (!ok) {
        alert(GPS_WARNING)
    }
}
 
/*
|--------------------------------------------------------------------------
| Pause / Resume
|--------------------------------------------------------------------------
*/
 
async function handlePause() {
    try {
        await $fetch(
            `${config.public.apiBase}/airspace-sessions/${activeSession.value.id}/pause`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${authStore.token}`
                }
            }
        )
 
        await stopTracking()
 
        await authStore.loadActiveSession()
 
        alert('Permission paused successfully.')
    } catch (error) {
        console.error(error)
 
        alert(
            error?.data?.message ||
            error?.response?._data?.message ||
            error?.message ||
            'Pause failed.'
        )
    }
}
 
async function handleResume() {
    try {
        await $fetch(
            `${config.public.apiBase}/airspace-sessions/${activeSession.value.id}/resume`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${authStore.token}`
                }
            }
        )
 
        await authStore.loadActiveSession()
 
        const ok = await startTracking()
 
        if (!ok) {
            alert('Permission resumed, but ' + GPS_WARNING)
        } else {
            alert('Permission resumed successfully.')
        }
    } catch (error) {
        console.error(error)
 
        alert(
            error?.data?.message ||
            error?.response?._data?.message ||
            error?.message ||
            'Resume failed.'
        )
    }
}
 
/*
|--------------------------------------------------------------------------
| Refresh Everything
|--------------------------------------------------------------------------
*/
 
const refreshEverything = async () => {
    await Promise.allSettled([
        refreshLocation(),
        crossCountryStore.refresh(),
        authStore.loadActiveSession(),
    ])
}
 
/*
|--------------------------------------------------------------------------
| Mounted / Unmounted
|--------------------------------------------------------------------------
*/
 
onMounted(async () => {
    await authStore.loadActiveSession()
 
    if (authStore.isAuthenticated) {
        await crossCountryStore.loadCurrentRequest()
    }
 
    await refreshEverything()
 
    // Expiry watcher
    checkExpiry()
 
    expiryTimer = setInterval(checkExpiry, 15000)
 
    document.addEventListener('visibilitychange', onVisibilityChange)
})
 
onUnmounted(() => {
    if (expiryTimer) {
        clearInterval(expiryTimer)
        expiryTimer = null
    }
 
    document.removeEventListener('visibilitychange', onVisibilityChange)
 
    // NOTE: native background GPS is intentionally NOT stopped here.
    // The pilot can lock the phone or navigate away while flying.
})
 
/*
|--------------------------------------------------------------------------
| QR Scanner
|--------------------------------------------------------------------------
*/
 
async function scanQrCode() {
    try {
        if (!Capacitor.isNativePlatform()) {
            alert('QR scanning is available in the LASF mobile app.')
            return
        }
 
        const {
            BarcodeScanner,
            BarcodeFormat
        } = await import('@capacitor-mlkit/barcode-scanning')
 
        const { supported } = await BarcodeScanner.isSupported()
 
        if (!supported) {
            alert('QR scanning is not supported on this device.')
            return
        }
 
        let permission = await BarcodeScanner.checkPermissions()
 
        if (permission.camera !== 'granted') {
            permission = await BarcodeScanner.requestPermissions()
        }
 
        if (permission.camera !== 'granted') {
            alert('Camera permission is required to scan QR codes. Please enable it in your phone Settings.')
            return
        }
 
        // Google Barcode Scanner module is Android only.
        if (Capacitor.getPlatform() === 'android') {
            const { available } =
                await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable()
 
            if (!available) {
                await BarcodeScanner.installGoogleBarcodeScannerModule()
 
                alert('Google QR Scanner installation has started. Please wait until it finishes, then try scanning again.')
                return
            }
        }
 
        const result = await BarcodeScanner.scan({
            formats: [BarcodeFormat.QrCode],
            autoZoom: true
        })
 
        if (!result.barcodes || result.barcodes.length === 0) {
            return
        }
 
        const barcode = result.barcodes[0]
        const qrValue = barcode.rawValue || barcode.displayValue || ''
 
        if (!qrValue) {
            alert('The QR code contains no readable value.')
            return
        }
 
        let url
 
        try {
            url = new URL(qrValue)
        } catch {
            alert('The QR code does not contain a valid URL.')
            return
        }
 
        if (url.protocol !== 'https:' && url.protocol !== 'http:') {
            alert('Invalid QR code URL.')
            return
        }
 
        const token = url.searchParams.get('token')
 
        if (!token) {
            alert('Invalid LASF QR code. Token not found.')
            return
        }
 
        if (url.hostname !== 'lasf.info' && url.hostname !== 'www.lasf.info') {
            alert('This QR code does not belong to LASF.')
            return
        }
 
        const locationPath = url.pathname
 
        if (!locationPath.startsWith('/location/')) {
            alert('The QR code does not contain a valid flying location.')
            return
        }
 
        await navigateTo({
            path: locationPath,
            query: { token }
        })
    } catch (error) {
        console.error('❌ QR SCANNER ERROR:', error)
 
        alert(
            error?.message ||
            error?.code ||
            'Unable to scan the QR code. Please try again.'
        )
    }
}
 
/*
|--------------------------------------------------------------------------
| Check In
|--------------------------------------------------------------------------
*/
 
async function handleCheckIn(token) {
    if (!token) return
    if (isFlyingHere.value) return
 
    checkingIn.value = true
 
    try {
        const response = await $fetch(
            `${config.public.apiBase}/airspace-sessions`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authStore.token}`
                },
                body: { token }
            }
        )
 
        authStore.activeSession = response.session
 
        await crossCountryStore.refresh()
 
        window.history.replaceState(
            {},
            '',
            `/location/${location.value.slug}`
        )
 
        // Start GPS and CHECK the result
        const gpsOk = await startTracking()
 
        if (gpsOk) {
            alert('Successfully checked in. GPS tracking is active.')
        } else {
            alert('Checked in, but ' + GPS_WARNING)
        }
 
        await refreshEverything()
    } catch (error) {
        console.error('Check-in error:', error)
 
        alert(
            error?.data?.message ||
            'Check-in failed.'
        )
    } finally {
        checkingIn.value = false
    }
}
 
/*
|--------------------------------------------------------------------------
| Auto Start Tracking
|--------------------------------------------------------------------------
|
| Starts GPS when the pilot opens the app while flying here and the
| session is ACTIVE and NOT expired. Never starts while paused/expired.
|
*/
 
watch(
    () => [isFlyingHere.value, activeSession.value?.status, expiresAtMs.value],
    async ([flying, status, expiresMs]) => {
        const expired = expiresMs && Date.now() >= expiresMs
 
        if (flying && status === 'active' && !expired) {
            await startTracking()
        }
    },
    { immediate: true }
)
 
/*
|--------------------------------------------------------------------------
| Check Out
|--------------------------------------------------------------------------
*/
 
async function handleCheckOut() {
    if (!activeSession.value) return
 
    if (!confirm('Are you sure you landed?')) return
 
    try {
        await $fetch(
            `${config.public.apiBase}/airspace-sessions/${activeSession.value.id}/checkout`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authStore.token}`
                }
            }
        )
 
        await stopTracking()
 
        authStore.activeSession = null
 
        await crossCountryStore.refresh()
        await refreshEverything()
 
        alert('Successfully checked out.')
    } catch (error) {
        console.error(error)
 
        alert(
            error?.data?.message ||
            'Checkout failed.'
        )
    }
}
</script>
 
<template>
<Breadcrumbs
    parent="Flying Locations"
    :title="location?.name"
/>
  <div class="location-page">
 
    <!-- Loading state -->
    <div v-if="pending" class="container py-5 text-center">
      <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading location information...</p>
    </div>
 
    <!-- Error state -->
    <div v-else-if="locationError" class="container py-5">
      <div class="alert alert-danger">
        <h4><i class="bi bi-exclamation-triangle"></i> Error Loading Location</h4>
        <p>{{ locationError.message || 'Failed to load location data' }}</p>
        <button @click="refreshLocation" class="btn btn-outline-danger mt-2">
          Try Again
        </button>
      </div>
    </div>
 
    <!-- Main content -->
    <div v-else-if="location" class="location-content">
 
      <!-- Header -->
      <div class="location-header py-5">
        <div class="container">
          <a
            href="#"
            class="text-decoration-none fw-semibold"
            @click.prevent="$router.back()"
          >
            <i class="bi bi-arrow-left me-2"></i>
            Back to Flying Locations
          </a>
 
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="display-5 fw-bold mb-5 text-dark">{{ location.name }}</h1>
              <div class="d-flex align-items-center gap-3">
                <span class="badge text-dark">{{ location.type }}</span>
              </div>
            </div>
            <div class="col-md-4 text-md-end"></div>
          </div>
        </div>
      </div>
 
      <!-- Main content -->
      <div class="container py-5">
        <div class="row g-4">
          <div class="col-lg-12">
            <div class="card shadow border-0 rounded-4">
              <div class="card-body p-5">
 
                <!-- Loading check-in state -->
                <div v-if="checkingIn" class="text-center py-4">
                  <div class="spinner-border text-success" style="width: 4rem; height: 4rem;" role="status">
                    <span class="visually-hidden">Checking in...</span>
                  </div>
                  <h3 class="mt-4">Processing Check-in...</h3>
                  <p class="text-muted">Please wait while we verify your session</p>
                </div>
 
                <!-- Not authenticated -->
                <div v-else-if="!authStore.isAuthenticated" class="text-center py-4">
                  <div class="icon-placeholder mb-4">
                    <i class="bi bi-person-lock display-1 text-muted"></i>
                  </div>
                  <h3 class="mb-3">Login Required</h3>
                  <p class="text-muted mb-4">You need to be logged in to check into this airspace</p>
                  <button
                    @click="navigateTo(`/login?redirect=${route.fullPath}`)"
                    class="btn btn-primary btn-lg px-5 rounded-pill"
                  >
                    <i class="bi bi-box-arrow-in-right me-2"></i>
                    Login Now
                  </button>
                </div>
 
                <!-- Already Flying Here -->
                <div v-else-if="isFlyingHere" class="text-center py-4">
 
                  <div class="alert alert-success border-0 rounded-3">
 
                    <div class="d-flex align-items-center justify-content-center mb-3">
                      <i class="bi bi-airplane-fill display-4 me-3"></i>
 
                      <div class="text-start">
                        <h3 class="fw-bold mb-1">You're Flying!</h3>
                        <p class="mb-0">Active at {{ location.name }}</p>
                      </div>
                    </div>
 
                    <div class="session-info bg-white bg-opacity-25 rounded-3 p-3 mb-4">
                      <div class="row text-center">
                        <div class="col">
                          <div class="fw-bold">Checked In</div>
                          <div class="text-muted small">
                            {{ formatTime(activeSession?.checked_in_at) }}
                          </div>
                        </div>
 
                        <div class="col">
                          <div class="fw-bold">Expires</div>
                          <div class="text-muted small">
                            {{ formatTime(activeSession?.expires_at) }}
                          </div>
                        </div>
 
                        <div class="col">
                          <div class="fw-bold">Time left</div>
                          <div class="text-muted small">
                            {{ remainingLabel }}
                          </div>
                        </div>
                      </div>
                    </div>
 
                    <!-- GPS status -->
                    <div
                      v-if="activeSession?.status === 'active' && gpsActive === false"
                      class="alert alert-danger text-start"
                    >
                      <strong>GPS is not active.</strong>
                      Your position is not being sent. Use the LASF mobile app,
                      allow location "all the time", then press Restart GPS.
                    </div>
 
                    <div
                      v-else-if="activeSession?.status === 'active' && gpsActive === true"
                      class="alert alert-light text-start py-2"
                    >
                      <i class="bi bi-broadcast me-2"></i> GPS tracking active
                 
                 <div
  v-if="activeSession?.status === 'active' && locationPermission === 'when_in_use'"
  class="alert alert-warning text-start"
>
  <strong>Location is set to "While Using".</strong>
  Tracking stops when your phone locks. Open Settings → LASF → Location
  and choose <strong>Always</strong>.
</div>
                    </div>
 
                    <div class="d-flex flex-column gap-3">
 
                      <!-- ACTIVE CROSS COUNTRY -->
                      <NuxtLink
                        v-if="canContinueCrossCountry"
                        :to="`/cross-country/active?id=${currentRequest.id}`"
                        class="btn btn-success btn-lg"
                      >
                        <i class="bi bi-airplane-engines me-2"></i>
                        Continue Cross Country
                      </NuxtLink>
 
                      <!-- APPROVED -->
                      <NuxtLink
                        v-else-if="canStartCrossCountry"
                        :to="`/cross-country/active?id=${currentRequest.id}`"
                        class="btn btn-primary btn-lg"
                      >
                        <i class="bi bi-play-circle me-2"></i>
                        Start Cross Country Flight
                      </NuxtLink>
 
                      <!-- PENDING -->
                      <button
                        v-else-if="isPending"
                        disabled
                        class="btn btn-warning btn-lg"
                      >
                        <i class="bi bi-hourglass-split me-2"></i>
                        Waiting For Approval
                      </button>
 
                      <!-- CREATE REQUEST -->
                      <NuxtLink
                        v-else-if="canCreateCrossCountry"
                        to="/cross-country/request"
                        class="btn btn-primary btn-lg"
                      >
                        <i class="bi bi-plus-circle me-2"></i>
                        Create Cross Country Request
                      </NuxtLink>
 
                      <div class="d-flex flex-column gap-3">
 
                        <button
                          v-if="activeSession?.status === 'active'"
                          type="button"
                          @click="handleRestartGps"
                          class="btn btn-outline-primary"
                        >
                          <i class="bi bi-arrow-repeat me-2"></i>
                          Restart GPS
                        </button>
 
                        <button
                          v-if="activeSession?.status === 'active'"
                          @click="handlePause"
                          class="btn btn-warning btn-lg"
                        >
                          Pause Permission
                        </button>
 
                        <button
                          v-if="activeSession?.status === 'paused'"
                          @click="handleResume"
                          class="btn btn-success btn-lg"
                        >
                          Resume Permission
                        </button>
 
                        <button
                          @click="handleCheckOut"
                          class="btn btn-danger btn-lg"
                        >
                          Close Permission
                        </button>
 
                      </div>
 
                    </div>
 
                    <div class="mt-4">
                      <div v-if="isPending" class="alert alert-warning">
                        Your Cross Country request is waiting for approval.
                      </div>
 
                      <div v-else-if="isApproved" class="alert alert-success">
                        Your request has been approved.
                      </div>
 
                      <div v-else-if="canContinueCrossCountry" class="alert alert-primary">
                        Your Cross Country flight is currently active.
                      </div>
                    </div>
 
                  </div>
 
                </div>
 
                <!-- Flying elsewhere -->
                <div
                  v-else-if="authStore.activeSession?.id"
                  class="text-center py-4"
                >
                  <div class="alert alert-warning border-0 rounded-3">
                    <i class="bi bi-exclamation-triangle display-4 mb-3"></i>
                    <h3 class="fw-bold mb-3">Already Active Elsewhere</h3>
                    <p class="mb-3">
                      You're currently checked in at
                      <strong>{{ authStore.activeSession.location?.name || 'another location' }}</strong>
                    </p>
                    <p class="text-muted small mb-0">
                      You must check out from your current location before checking in here
                    </p>
                  </div>
                </div>
 
                <!-- Ready to check in -->
                <div v-else class="text-center py-4">
                  <div class="checkin-ready">
                    <div class="icon-placeholder mb-4">
                      <i class="bi bi-airplane-takeoff display-1 text-primary"></i>
                    </div>
 
                    <h2 class="mb-3">Ready to Fly?</h2>
                    <p class="text-muted mb-4">
                      Start your flight session at {{ location.name }}
                    </p>
 
                    <!-- QR token available -->
                    <div v-if="route.query.token" class="mb-4">
                      <div class="alert alert-info border-0 rounded-3 mb-4">
                        <i class="bi bi-qr-code-scan me-2"></i>
                        QR Code detected - Ready for check-in
                      </div>
 
                      <button
                        v-if="canCheckIn"
                        @click="handleCheckIn(route.query.token)"
                        class="btn btn-success btn-lg px-5 rounded-pill"
                      >
                        <i class="bi bi-play-circle me-2"></i>
                        Start Flight Session
                      </button>
 
                      <div v-else class="alert alert-danger">
                        This flying location is closed today.
                      </div>
                    </div>
 
                    <!-- No QR token -->
                    <div v-else class="mb-4">
                      <div class="alert alert-secondary border-0 rounded-3 mb-4">
                        <i class="bi bi-qr-code me-2"></i>
                        Scan a QR code at the location to get started
                      </div>
 
                      <button
                        type="button"
                        @click="scanQrCode"
                        class="btn btn-success btn-lg px-5 rounded-pill"
                      >
                        <i class="bi bi-qr-code-scan me-2"></i>
                        Scan QR Code to Begin
                      </button>
                    </div>
 
                    <p class="text-muted small mt-3">
                      Session will expire automatically after 7 hours
                    </p>
                  </div>
                </div>
 
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
 
<style scoped>
.location-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}
 
.card {
  border: none;
  transition: transform 0.2s ease-in-out;
}
 
.card:hover {
  transform: translateY(-2px);
}
 
.icon-placeholder {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 50%;
}
 
.session-info {
  backdrop-filter: blur(10px);
}
 
.btn-primary {
  background-color: #0f6847;
  border-color: #0f6847;
}
 
.btn-primary:hover {
  background-color: #0a5034;
  border-color: #0a5034;
}
 
.rounded-4 {
  border-radius: 1rem;
}
</style>
 