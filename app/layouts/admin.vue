<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <div class="sidebar" :class="{ 'collapsed': sidebarCollapsed }">
      <!-- Logo -->
      <div class="sidebar-header">
        <NuxtLink to="/admin/dashboard" class="logo-link">
          <i class="bi bi-airplane fs-4"></i>
          <span v-if="!sidebarCollapsed" class="logo-text">
            <img src="/assets/images/icons/logo.png" class="w-80px" />
          </span>
        </NuxtLink>
        <button class="sidebar-toggle" @click="toggleSidebar">
          <i :class="sidebarCollapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-left'"></i>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="nav-label" v-if="!sidebarCollapsed">Main</div>
          <NavItem 
            :active="$route.path === '/admin/dashboard'"
            :collapsed="sidebarCollapsed"
            icon="bi-speedometer2"
            label="Dashboard"
            to="/admin/dashboard"
          />
        </div>

        <div class="nav-section">
          <div class="nav-label" v-if="!sidebarCollapsed">Management</div>
          <NavItem 
            :active="$route.path.startsWith('/admin/locations')"
            :collapsed="sidebarCollapsed"
            icon="bi-geo-alt"
            label="Locations"
            to="/admin/locations"
          />
          <NavItem 
            :active="$route.path.startsWith('/admin/newscategories')"
            :collapsed="sidebarCollapsed"
            icon="bi-newspaper"
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
            :active="$route.path.startsWith('/admin/pilots')"
            :collapsed="sidebarCollapsed"
            icon="bi-people"
            label="Pilots"
            to="/admin/pilots"
          />
          <NavItem 
            :active="$route.path.startsWith('/admin/sports')"
            :collapsed="sidebarCollapsed"
            icon="bi-clock-history"
            label="Sports"
            to="/admin/sports"
          />
                  <NavItem 
            :active="$route.path.startsWith('/admin/testimonials')"
            :collapsed="sidebarCollapsed"
            icon="bi-clock-history"
            label="Testimonials"
            to="/admin/testimonials"
          />

             <NavItem 
            :active="$route.path.startsWith('/admin/events')"
            :collapsed="sidebarCollapsed"
            icon="bi-clock-history"
            label="Events"
            to="/admin/events"
          />

                 <NavItem 
            :active="$route.path.startsWith('/admin/gallery')"
            :collapsed="sidebarCollapsed"
            icon="bi-clock-history"
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
            :active="$route.path.startsWith('/admin/settings')"
            :collapsed="sidebarCollapsed"
            icon="bi-shield-check"
            label="Settings"
            to="/admin/settings"
          />
        </div>

   
      </nav>

      <!-- User Profile -->
      <div class="sidebar-footer">
        <div class="user-profile">
          <div class="user-avatar">
            <i class="bi bi-person-circle"></i>
          </div>
          <div v-if="!sidebarCollapsed" class="user-info">
            <div class="user-name"><p class="text-muted">
  Welcome back, {{ authStore.userFullName || 'Admin' }}
</p>
</div>
            <div class="user-role">Administrator</div>
          </div>
        </div>
        <button @click="logout" class="logout-btn">
          <i class="bi bi-box-arrow-right"></i>
          <span v-if="!sidebarCollapsed">Logout</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content" :class="{ 'expanded': sidebarCollapsed }">
      <!-- Top Navigation Bar -->
      <header class="topbar">
        <div class="topbar-left">
          <button class="menu-toggle" @click="toggleSidebar">
            <i class="bi bi-list"></i>
          </button>
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>

      </header>

      <!-- Page Content -->
      <main class="content-wrapper">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from '#app'
import { useAuthStore } from '~/stores/auth'
import NavItem from '../components/Frontend/NavItem.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const sidebarCollapsed = ref(false)

const pageTitle = computed(() => {
  const titles = {
    '/admin/dashboard': 'Dashboard',
    '/admin/locations': 'Locations',
    '/admin/qrcodes': 'QR Codes',
    '/admin/news': 'News',
    '/admin/events': 'Events',
    '/admin/pilots': 'Pilots',
    '/admin/sports': 'Sports',
    '/admin/about': 'About LASF Page',
    '/admin/regulations': 'Safety & Regulations',
    '/admin/testimonials': 'Testimonials',
    '/admin/reports': 'Reports',
    '/admin/settings': 'Settings'
  }
  
  // Find matching route
  for (const [path, title] of Object.entries(titles)) {
    if (route.path.startsWith(path)) {
      return title
    }
  }
  
  return 'Admin Dashboard'
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const logout = async () => {
  await authStore.logout()
}

// Check admin status on mount
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    const isAuth = await authStore.checkAuth()
    if (!isAuth) {
      navigateTo('/login')
    } else if (!authStore.isAdmin) {
      navigateTo('/')
    }
  } else if (!authStore.isAdmin) {
    navigateTo('/')
  }
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* Sidebar Styles */
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
  font-size: 1.4rem;
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
  font-size: 1.4rem;
}

.user-role {
  font-size: 1.4rem;
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

/* Main Content Styles */
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  font-size: 1.8rem;
  font-weight: 600;
}

.quick-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.content-wrapper {
  padding: 25px;
  min-height: calc(100vh - 70px);
}

/* Responsive Design */
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
  width: 180px;
}
</style>