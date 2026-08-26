<template>
  <div class="admin-layout">
    <div class="sidebar" :class="{ 'collapsed': sidebarCollapsed }">
      <div class="sidebar-header">
<NuxtLink
    :to="authStore.isBeirutAirport
        ? '/admin/weather'
        : '/admin/dashboard'"
    class="logo-link"
>
          <i class="bi bi-airplane fs-4"></i>
          <span v-if="!sidebarCollapsed" class="logo-text">
            <img src="/assets/images/icons/logo.png" class="w-80px" />
          </span>
        </NuxtLink>

        <button class="sidebar-toggle" @click="toggleSidebar">
          <i :class="sidebarCollapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-left'"></i>
        </button>
      </div>

      <nav class="sidebar-nav">
<template v-if="!authStore.isBeirutAirport">

    <div class="nav-section">

        <div
            class="nav-label"
            v-if="!sidebarCollapsed"
        >
            Main
        </div>

        <NavItem
            :active="$route.path === '/admin/dashboard'"
            :collapsed="sidebarCollapsed"
            icon="bi-speedometer2"
            label="Dashboard"
            to="/admin/dashboard"
        />

    </div>

</template>

        <div class="nav-section">
     <div
    class="nav-label"
    v-if="
        !sidebarCollapsed &&
        !authStore.isBeirutAirport
    "
>
    Management
</div>
         <template v-if="authStore.isAdmin || authStore.isBeirutAirport">

    <NavItem
        :active="$route.path.startsWith('/admin/weather')"
        :collapsed="sidebarCollapsed"
        icon="bi-cloud-sun"
        label="Weather Reports"
        to="/admin/weather"
    />

</template> 
        
  <!-- ============================= -->
  <!-- LOCATIONS (Admin + Army) -->
  <!-- ============================= -->

<template v-if="authStore.canViewLocations">
  <NavItem
    :active="$route.path.startsWith('/admin/locations')"
    :collapsed="sidebarCollapsed"
    icon="bi-geo-alt"
    label="Locations"
    to="/admin/locations"
  />
</template>

  <!-- ============================= -->
  <!-- LIVE TRACKING (Admin + Army + Watcher) -->
  <!-- ============================= -->

<template
    v-if="
        authStore.canViewLiveTracking &&
        !authStore.isBeirutAirport
    "
>

    <NavItem
      :active="$route.path.startsWith('/admin/live-tracking')"
      :collapsed="sidebarCollapsed"
      icon="bi-crosshair"
      label="Live Tracking"
      to="/admin/live-tracking"
    />

  </template>

  <!-- ============================= -->
  <!-- PILOTS (Admin + Army) -->
  <!-- ============================= -->

  <template v-if="authStore.canViewPilots">

    <NavItem
      :active="$route.path.startsWith('/admin/pilots')"
      :collapsed="sidebarCollapsed"
      icon="bi-people"
      label="Pilots"
      to="/admin/pilots"
    />

  </template>

  <!-- ============================= -->
  <!-- ADMIN ONLY -->
  <!-- ============================= -->
    <template v-if="authStore.isAdmin">
<NavItem
    :active="$route.path.startsWith('/admin/cross-country')"
    :collapsed="sidebarCollapsed"
    icon="bi-airplane-engines"
    label="Cross Country"
    to="/admin/cross-country"
/>

            <NavItem 
              :active="$route.path.startsWith('/admin/newscategories')"
              :collapsed="sidebarCollapsed"
              icon="bi-tags"
              label="News Categories"
              to="/admin/newscategories"
            />
            <NavItem 
              :active="$route.path.startsWith('/admin/news')"
              :collapsed="sidebarCollapsed"
              icon="bi-newspaper"
              label="News"
              to="/admin/news"
            />

<NavItem
  :active="$route.path.startsWith('/admin/pilot-safety-message')"
  :collapsed="sidebarCollapsed"
  icon="bi-exclamation-triangle-fill"
  label="Pilot Safety"
  to="/admin/pilot-safety-message"
/>

            <NavItem 
              :active="$route.path.startsWith('/admin/sports')"
              :collapsed="sidebarCollapsed"
              icon="bi-trophy"
              label="Sports"
              to="/admin/sports"
            />
            <NavItem 
              :active="$route.path.startsWith('/admin/testimonials')"
              :collapsed="sidebarCollapsed"
              icon="bi-chat-quote"
              label="Testimonials"
              to="/admin/testimonials"
            />
            <NavItem 
              :active="$route.path.startsWith('/admin/events')"
              :collapsed="sidebarCollapsed"
              icon="bi-calendar-event"
              label="Events"
              to="/admin/events"
            />
            <NavItem 
              :active="$route.path.startsWith('/admin/gallery')"
              :collapsed="sidebarCollapsed"
              icon="bi-images"
              label="Gallery"
              to="/admin/gallery"
            />
            <NavItem 
              :active="$route.path.startsWith('/admin/about')"
              :collapsed="sidebarCollapsed"
              icon="bi-info-square"
              label="About LASF"
              to="/admin/about"
            />
            <NavItem 
              :active="$route.path.startsWith('/admin/regulations')"
              :collapsed="sidebarCollapsed"
              icon="bi-shield-check"
              label="Regulations"
              to="/admin/regulations"
            />

            <NavItem
    :active="$route.path.startsWith('/admin/feedback')"
    :collapsed="sidebarCollapsed"
    icon="bi-chat-square-text"
    label="Feedback"
    to="/admin/feedback"
/>
<NavItem
    :active="$route.path.startsWith('/admin/contact-messages')"
    :collapsed="sidebarCollapsed"
    icon="bi-envelope-paper"
    label="Contact Messages"
    to="/admin/contact-messages"
/>

          </template>

        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile">
          <div class="user-avatar">
            <i class="bi bi-person-circle"></i>
          </div>
          <div v-if="!sidebarCollapsed" class="user-info">
            <div class="user-name">
              <p class="mb-0">
                {{ authStore.user?.name || 'User' }}
              </p>
            </div>
<div class="user-role">
{{
  authStore.isAdmin
    ? 'Administrator'
    : authStore.isArmy
      ? 'Lebanese Army'
      : authStore.isWatcher
        ? 'Watcher'
        : authStore.isBeirutAirport
          ? 'Beirut Airport'
          : authStore.isPermission
            ? 'Permission Officer'
            : 'Pilot'
}}
</div>
          </div>
        </div>
        <button @click="logout" class="logout-btn">
          <i class="bi bi-box-arrow-right"></i>
          <span v-if="!sidebarCollapsed">Logout</span>
        </button>
      </div>
    </div>

    <div class="main-content" :class="{ 'expanded': sidebarCollapsed }">
      <header class="topbar">
        <div class="topbar-left">
          <button class="menu-toggle" @click="toggleSidebar">
            <i class="bi bi-list"></i>
          </button>
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
      </header>

      <main class="content-wrapper">
        <slot />
      </main>
          
    </div>
      <StatusNotifications />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from '#app'
import { useAuthStore } from '~/stores/auth'
import NavItem from '../components/Frontend/NavItem.vue'
import StatusNotifications from '~/components/StatusNotifications.vue'
import { useStatusNotifications } from '~/composables/useStatusNotifications'
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const sidebarCollapsed = ref(false)
const config = useRuntimeConfig()
const pageTitle = computed(() => {
  const titles = {
    '/admin/dashboard': 'Dashboard',
    '/admin/weather': 'Weather Reports',
      '/admin/live-tracking': 'Live Tracking',
    '/admin/locations': 'Locations',
    '/admin/cross-country': 'Cross Country',
    
    '/admin/news': 'News',
    '/admin/events': 'Events',
    '/admin/pilots': 'Pilots',
    '/admin/sports': 'Sports',
    '/admin/about': 'About LASF Page',
    '/admin/pilot-safety-message': 'Pilot Safety Message',
    '/admin/regulations': 'Safety & Regulations',
    '/admin/feedback': 'Feedback & Complaints',
    '/admin/contact-messages': 'Contact Messages',
    '/admin/testimonials': 'Testimonials',
    '/admin/gallery': 'Gallery'
  }
  
  for (const [path, title] of Object.entries(titles)) {
    if (route.path.startsWith(path)) return title
  }
  
  return 'Admin Dashboard'
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const logout = async () => {
  await authStore.logout()
  navigateTo('/login')
}


// AdminLayout.vue

// Inside <script setup> of AdminLayout.vue


const {
    addNotification
} = useStatusNotifications()

let statusPollingTimer = null

const previousStatuses = ref({})

const getStatusLabel = (status) => {

    switch (status) {

        case 'green':
            return 'Open'

        case 'yellow':
            return 'Pending'

        case 'red':
            return 'Closed'

        default:
            return 'Unknown'
    }
}
const formatPermissionDate = (date) => {

    if (!date) {
        return ''
    }

    return new Date(date).toLocaleDateString(
        'en-US',
        {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }
    )
}
const checkStatusChanges = (locations) => {

    locations.forEach(location => {

        const permission =
            location.clearance_statuses?.[0]

        if (!permission) {
            return
        }

        const permissionDate =
            permission.permission_date

        const key =
            `${location.id}-${permissionDate}`

        const newStatus =
            permission.status ?? 'red'

        const oldStatus =
            previousStatuses.value[key]

        /*
         * First time we see this location/date.
         * Do not show notification.
         */
        if (oldStatus === undefined) {

            previousStatuses.value[key] =
                newStatus

            return
        }

        /*
         * Nothing changed.
         */
        if (oldStatus === newStatus) {
            return
        }

        /*
         * Save the new status.
         */
        previousStatuses.value[key] =
            newStatus

        const updatedByRole =
            permission.updated_by?.role

        /*
         * Format permission date.
         */
        const formattedDate =
            new Date(permissionDate).toLocaleDateString(
                'en-US',
                {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }
            )

        /*
         * Army → Permission
         */
        if (
            updatedByRole === 'army' &&
            authStore.isPermission
        ) {

            addNotification({

                title: 'Army Status Update',

                message:
                    `${location.name} — ${formattedDate} ` +
                    `changed from ` +
                    `${getStatusLabel(oldStatus)} to ` +
                    `${getStatusLabel(newStatus)}.`
            })

            return
        }

        /*
         * Permission → Army
         */
        if (
            updatedByRole === 'permission' &&
            authStore.isArmy
        ) {

            addNotification({

                title: 'Permission Status Update',

                message:
                    `${location.name} — ${formattedDate} ` +
                    `changed from ` +
                    `${getStatusLabel(oldStatus)} to ` +
                    `${getStatusLabel(newStatus)}.`
            })
        }

    })
}
const lastStatusCheck = ref(null)
const checkStatuses = async () => {

    try {

        const res = await $fetch(
            `${config.public.apiBase}/admin/clearance-statuses/changes`,
            {
                query: {
                    since: lastStatusCheck.value
                },

                headers: {
                    Authorization:
                        `Bearer ${authStore.token}`
                }
            }
        )

        const changes = res.data || []

        for (const change of changes) {

            const changedByRole =
                change.changed_by?.role

            /*
            |--------------------------------------------------------------------------
            | Army -> Permission
            |--------------------------------------------------------------------------
            */

            if (
                changedByRole === 'army' &&
                authStore.isPermission
            ) {

                addNotification({

                    title: 'Army Status Update',

                    message:
                        `${change.location?.name} — ` +
                        `${formatPermissionDate(change.permission_date)} ` +
                        `changed from ` +
                        `${getStatusLabel(change.old_status)} ` +
                        `to ` +
                        `${getStatusLabel(change.new_status)}.`
                })
            }

            /*
            |--------------------------------------------------------------------------
            | Permission -> Army
            |--------------------------------------------------------------------------
            */

            if (
                changedByRole === 'permission' &&
                authStore.isArmy
            ) {

                addNotification({

                    title: 'Permission Status Update',

                    message:
                        `${change.location?.name} — ` +
                        `${formatPermissionDate(change.permission_date)} ` +
                        `changed from ` +
                        `${getStatusLabel(change.old_status)} ` +
                        `to ` +
                        `${getStatusLabel(change.new_status)}.`
                })
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Remember the last check
        |--------------------------------------------------------------------------
        */

        lastStatusCheck.value =
            new Date().toISOString()

        localStorage.setItem(
            'last-status-check',
            lastStatusCheck.value
        )

    } catch (error) {

        console.error(
            'GLOBAL STATUS CHECK ERROR:',
            error
        )
    }
}
onMounted(async () => {

    /*
    |--------------------------------------------------------------------------
    | localStorage is available only in the browser
    |--------------------------------------------------------------------------
    */

    lastStatusCheck.value =
        localStorage.getItem('last-status-check')
        || new Date(
            Date.now() - 10000
        ).toISOString()

    if (!authStore.isAuthenticated) {

        const isAuth =
            await authStore.checkAuth()

        if (!isAuth) {
            return navigateTo('/login')
        }
    }

    await checkStatuses()

    statusPollingTimer =
        setInterval(
            checkStatuses,
            5000
        )

    // keep the rest of your existing role/access code here
})
onBeforeUnmount(() => {

    if (statusPollingTimer) {

        clearInterval(
            statusPollingTimer
        )

    }

})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.sidebar {
  width: 250px;
  background: linear-gradient(180deg, #2c3e50 0%, #1a252f 100%);
  color: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: fixed;
  height: 100vh;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-link {
  display: flex;
  align-items: center;
  color: white;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.6rem;
}

.logo-text {
  margin-left: 10px;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 20px;
}

.nav-label {
  padding: 0 20px 10px 20px;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.5);
}

.sidebar-footer {
  border-top: 1px solid rgba(255,255,255,0.1);
  padding: 15px;
}

.user-profile {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.user-info {
  margin-left: 10px;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.user-role {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.7);
}

.logout-btn {
  width: 100%;
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255,255,255,0.2);
}

.main-content {
  flex: 1;
  margin-left: 250px;
  transition: all 0.3s ease;
}

.main-content.expanded {
  margin-left: 70px;
}

.topbar {
  background: white;
  padding: 15px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: #6c757d;
}

.page-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #334155;
}

.content-wrapper {
  padding: 25px;
  min-height: calc(100vh - 70px);
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.collapsed {
    transform: translateX(0);
    width: 70px;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .main-content.expanded {
    margin-left: 70px;
  }
}
.w-80px{
  width: 150px;
}
</style>