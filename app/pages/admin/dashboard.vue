<template>
  <div class="admin-dashboard">
    <!-- Dashboard Header -->
    <div class="dashboard-header mb-5">
      <h1 class="display-5 fw-bold">
        <i class="bi bi-speedometer2 me-3"></i>
        Dashboard Overview
      </h1>
      <p class="text-muted">
        Welcome back, {{ authStore.user?.name || 'Admin' }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading dashboard data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle me-2"></i>
      Failed to load dashboard data: {{ error }}
    </div>

    <!-- Main Dashboard Content -->
    <div v-else>
      <!-- Quick Stats Cards -->
      <div class="row mb-5">
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card stat-card border-primary">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-uppercase text-muted mb-0">Active Locations</h6>
                  <h2 class="fw-bold mb-0">{{ stats.activeLocations || 0 }}</h2>
                </div>
                <div class="stat-icon bg-primary">
                  <i class="bi bi-geo-alt"></i>
                </div>
              </div>
              <div class="mt-3">
                <small class="text-muted">
                  <span class="text-success">
                    <i class="bi bi-check-circle me-1"></i>
                    {{ locationStatus.cleared }} cleared
                  </span>
                </small>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card stat-card border-success">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-uppercase text-muted mb-0">Active Pilots</h6>
                  <h2 class="fw-bold mb-0">{{ stats.activePilots || 0 }}</h2>
                </div>
                <div class="stat-icon bg-success">
                  <i class="bi bi-people"></i>
                </div>
              </div>
              <div class="mt-3">
                <small class="text-muted">
                  <span class="text-success">
                    <i class="bi bi-person-check me-1"></i>
                    Registered users
                  </span>
                </small>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card stat-card border-warning">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-uppercase text-muted mb-0">QR Scans Today</h6>
                  <h2 class="fw-bold mb-0">{{ stats.qrScansToday || 0 }}</h2>
                </div>
                <div class="stat-icon bg-warning">
                  <i class="bi bi-qr-code"></i>
                </div>
              </div>
              <div class="mt-3">
                <small class="text-muted">
                  <span class="text-success">
                    <i class="bi bi-arrow-up me-1"></i>
                    Active sessions
                  </span>
                </small>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card stat-card border-info">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-uppercase text-muted mb-0">Active News</h6>
                  <h2 class="fw-bold mb-0">{{ stats.activeNews || 0 }}</h2>
                </div>
                <div class="stat-icon bg-info">
                  <i class="bi bi-newspaper"></i>
                </div>
              </div>
              <div class="mt-3">
                <small class="text-muted">
                  <span class="text-danger" v-if="urgentNotices.length > 0">
                    <i class="bi bi-exclamation-circle me-1"></i>
                    {{ urgentNotices.length }} urgent notices
                  </span>
                  <span class="text-success" v-else>
                    <i class="bi bi-check-circle me-1"></i>
                    No urgent notices
                  </span>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="row">
        <!-- Left Column -->
        <div class="col-lg-8">
          <!-- Locations Status Map -->
          <div class="card shadow mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">
                <i class="bi bi-map me-2"></i>
                Locations Status Summary
              </h5>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-md-4">
                  <div class="p-3">
                    <div class="display-4 text-success">{{ locationStatus.cleared }}</div>
                    <div class="text-muted">Cleared Locations</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="p-3">
                    <div class="display-4 text-warning">{{ locationStatus.restricted }}</div>
                    <div class="text-muted">Restricted Locations</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="p-3">
                    <div class="display-4 text-danger">{{ locationStatus.closed }}</div>
                    <div class="text-muted">Closed Locations</div>
                  </div>
                </div>
              </div>
              
              <!-- Recent Location Updates -->
              <div class="mt-4">
                <h6 class="mb-3">Recent Location Updates</h6>
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Location</th>
                        <th>Region</th>
                        <th>Status</th>
                        <th>Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="location in locationStatus.locations.slice(0, 5)" :key="location.name">
                        <td>{{ location.name }}</td>
                        <td>{{ location.region }}</td>
                        <td>
                          <span :class="`badge bg-${getStatusColor(location.status)}`">
                            {{ location.status }}
                          </span>
                        </td>
                        <td class="text-muted small">
                          {{ formatTime(location.updated_at) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="card shadow mb-4">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-clock-history me-2"></i>
                Recent Activity
              </h5>
            </div>
            <div class="card-body">
              <div class="activity-feed">
                <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                  <div class="activity-icon" :class="activity.type">
                    <i :class="activity.icon"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-text">{{ activity.text }}</div>
                    <div class="activity-time">{{ activity.time }}</div>
                  </div>
                </div>
                <div v-if="recentActivities.length === 0" class="text-center py-4 text-muted">
                  <i class="bi bi-activity fs-1 mb-3"></i>
                  <p>No recent activity</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="col-lg-4">
      
       

          <!-- Urgent Notices -->
          <div class="card shadow border-danger">
            <div class="card-header bg-danger text-white">
              <h5 class="mb-0">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Urgent Notices ({{ urgentNotices.length }})
              </h5>
            </div>
            <div class="card-body">
              <div v-if="urgentNotices.length > 0">
                <div v-for="notice in urgentNotices" :key="notice.id" class="notice-item mb-3">
                  <div class="notice-title">
                    <i class="bi bi-exclamation-circle text-danger me-2"></i>
                    {{ notice.title }}
                  </div>
                  <div class="notice-content small text-muted">{{ notice.content }}</div>
                  <div class="notice-time small">{{ notice.time }}</div>
                </div>
              </div>
              <div v-else class="text-center py-3">
                <i class="bi bi-check-circle fs-1 text-success mb-3"></i>
                <p class="mb-0">No urgent notices</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'admin',

})


const authStore = useAuthStore()
const loading = ref(true)
const error = ref(null)

// Dashboard data
const stats = ref({})
const recentActivities = ref([])
const urgentNotices = ref([])
const locationStatus = ref({
  cleared: 0,
  restricted: 0,
  closed: 0,
  locations: []
})
const systemStatus = ref({})

// Load dashboard data
const loadDashboardData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const { data } = await $fetch('http://127.0.0.1:8000/api/admin/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (data) {
      stats.value = data.stats || {}
      recentActivities.value = data.recentActivities || []
      urgentNotices.value = data.urgentNotices || []
      locationStatus.value = data.locationStatus || {}
      systemStatus.value = data.systemStatus || {}
    }
    
  } catch (err) {
    console.error('Failed to load dashboard data:', err)
    error.value = err.message || 'Unknown error occurred'
    
    // Fallback to mock data if API fails
    stats.value = {
      activeLocations: 8,
      activePilots: 24,
      qrScansToday: 156,
      activeNews: 7
    }
    locationStatus.value = {
      cleared: 5,
      restricted: 2,
      closed: 1,
      locations: [
        { name: 'Jounieh Bay', region: 'Mount Lebanon', status: 'cleared', updated_at: new Date() },
        { name: 'Faqra Club', region: 'Mount Lebanon', status: 'restricted', updated_at: new Date() },
        { name: 'Chekka Coast', region: 'North', status: 'cleared', updated_at: new Date() },
      ]
    }
    systemStatus.value = {
      api_server: { status: 'online', label: 'API Server' },
      database: { status: 'online', label: 'Database' },
      qr_scanner: { status: 'online', label: 'QR Scanner' },
      auto_checkout: { status: 'online', label: 'Auto-Checkout' },
    }
    
  } finally {
    loading.value = false
  }
}

// Helper functions
const getStatusColor = (status) => {
  switch (status) {
    case 'cleared': return 'success'
    case 'restricted': return 'warning'
    case 'closed': return 'danger'
    default: return 'secondary'
  }
}

const formatTime = (time) => {
  if (!time) return 'Just now'
  const date = new Date(time)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 60) return `${diffMins} mins ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`
  return `${Math.floor(diffMins / 1440)} days ago`
}

const manageQRCodes = () => {
  navigateTo('/admin/flying-locations?tab=qr-codes')
}

const exportReports = async () => {
  try {
    const response = await $fetch('/api/admin/reports/export', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.download_url) {
      window.open(response.download_url, '_blank')
    }
  } catch (error) {
    console.error('Export failed:', error)
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.admin-dashboard {
  padding: 20px 0;
}

.dashboard-header {
  border-bottom: 2px solid #dee2e6;
  padding-bottom: 20px;
}

/* Stats Cards */
.stat-card {
  border-radius: 15px;
  transition: all 0.3s ease;
  border-width: 2px;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

/* Activity Feed */
.activity-feed {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.activity-item:hover {
  background-color: #f8f9fa;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.activity-icon.checkin { background-color: rgba(40, 167, 69, 0.1); color: #28a745; }
.activity-icon.qr { background-color: rgba(13, 110, 253, 0.1); color: #0d6efd; }
.activity-icon.location { background-color: rgba(255, 193, 7, 0.1); color: #ffc107; }
.activity-icon.news { background-color: rgba(23, 162, 184, 0.1); color: #17a2b8; }
.activity-icon.pilot { background-color: rgba(108, 117, 125, 0.1); color: #6c757d; }

.activity-content {
  flex: 1;
}

.activity-text {
  font-weight: 500;
  margin-bottom: 5px;
}

.activity-time {
  font-size: 0.85rem;
  color: #6c757d;
}

/* Quick Actions */
.btn {
  padding: 12px;
  font-weight: 500;
  text-align: left;
  border-radius: 10px;
}

/* System Status */
.status-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  font-weight: 500;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
}

.status-indicator.online {
  color: #28a745;
}

.status-indicator.offline {
  color: #dc3545;
}

/* Urgent Notices */
.notice-item {
  padding: 15px;
  background: #f8d7da;
  border-radius: 8px;
  border-left: 4px solid #dc3545;
}

.notice-title {
  font-weight: 600;
  color: #721c24;
  margin-bottom: 5px;
}

.notice-content {
  color: #721c24;
  opacity: 0.8;
}

.notice-time {
  color: #721c24;
  opacity: 0.6;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header h1 {
    font-size: 2rem;
  }
  
  .stat-card .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
}
</style>