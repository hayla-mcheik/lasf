<template>
  <div class="enhanced-location-card">
    <div class="card-inner">
      <div class="card-header" :class="'status-' + statusKey">
        <div class="status-indicator">
          <div class="status-dot"></div>
          <div class="status-glow"></div>
        </div>
        <div class="header-content">
          <h5 class="location-name text-white">{{ location?.name }}</h5>
          <div class="location-region text-white-50 small">
            <i class="bi bi-geo-alt"></i> {{ location?.region }}
          </div>
        </div>
      </div>

      <div class="card-body">
        <div class="sports-tags mb-3">
          <span v-for="sport in location?.sports" :key="sport.id" class="sport-tag">
            <i class="bi" :class="getSportIcon(sport.name)"></i> {{ sport.name }}
          </span>
        </div>

        <div class="status-details p-3 rounded-3 mb-3 bg-light border-start border-4" :class="'border-' + bootstrapColor">
          <div class="status-message small fw-bold">
            <i class="bi" :class="statusIcon"></i>
            {{ location?.clearance_statuses?.[0]?.reason || '' }}
          </div>
   
        </div>

        <div v-if="location?.active_sessions_count > 0" class="active-pilots-widget p-3 rounded-3 d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-people-fill text-primary"></i>
            <span class="small fw-bold">Active Pilots: {{ location.active_sessions_count }}</span>
          </div>
        </div>
      </div>

<div class="card-footer bg-white border-top p-3 d-flex gap-2">
      <NuxtLink :to="'/location/' + location?.slug" class="btn btn-outline-primary flex-grow-1 btn-sm py-2">Details</NuxtLink>
      
      <button 
        class="btn flex-grow-1 btn-sm py-2" 
        :class="isCurrentLocationSession ? 'btn-success' : 'btn-primary'"
        @click="navigateTo(`/location/${location.slug}`)" 
        :disabled="statusKey !== 'cleared' || (authStore.isPilotFlying && !isCurrentLocationSession)"
      >
        <i class="bi" :class="isCurrentLocationSession ? 'bi-airplane-fill' : 'bi-qr-code-scan'"></i>
        {{ isCurrentLocationSession ? 'Currently Flying' : 'Check-in' }}
      </button>
    </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const props = defineProps({ location: Object });

// Fixed the undefined ID check by adding optional chaining
const isCurrentLocationSession = computed(() => {
  if (!props.location?.id || !authStore.activeSession) return false;
  return authStore.activeSession.flying_location_id === props.location.id;
});

const statusKey = computed(() => {
  const s = props.location?.clearance_statuses?.[0]?.status || 'green';
  return s === 'green' ? 'cleared' : 'closed';
});
const bootstrapColor = computed(() => statusKey.value === 'cleared' ? 'success' : 'danger');
const statusIcon = computed(() => statusKey.value === 'cleared' ? 'bi-check-circle-fill' : 'bi-x-circle-fill');

const getSportIcon = (name) => {
  const icons = { 'Paragliding': 'bi-parachute', 'Hang Gliding': 'bi-airplane', 'Paramotoring': 'bi-fan' };
  return icons[name] || 'bi-wind';
};

const formatTime = (date) => {
  if (!date) return 'Recently';
  const diff = Math.floor((new Date() - new Date(date)) / 60000);
  return diff < 60 ? `${diff}m ago` : `${Math.floor(diff / 60)}h ago`;
};
</script>
<style scoped>
.enhanced-location-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 25px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  height: 100%;
  border: 1px solid #e9ecef;
}

.enhanced-location-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
  border-color: #0d6efd;
}

.card-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-header {
  padding: 24px;
  color: white;
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
  overflow: hidden;
  min-height: 100px;
}

.card-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.1) 0%, transparent 100%);
}

.card-header.status-cleared {
  background: linear-gradient(135deg, #198754 0%, #157347 100%);
}

.card-header.status-restricted {
  background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
}

.card-header.status-closed {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.status-indicator {
  position: relative;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.status-dot {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: white;
  position: relative;
  z-index: 2;
}

.status-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  opacity: 0.3;
  animation: statusPulse 2s infinite;
}

@keyframes statusPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.1;
  }
}

.header-content {
  flex: 1;
}

.location-name {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.location-region {
  font-size: 1.4rem;
  opacity: 0.9;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-actions {
  flex-shrink: 0;
}

.btn-favorite {
  background: rgba(255,255,255,0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  z-index: 2;
}

.btn-favorite:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.1);
}

.btn-favorite.favorited {
  background: rgba(255,255,255,0.3);
  color: #ffc107;
}

.btn-favorite.favorited:hover {
  background: rgba(255,255,255,0.4);
}

.card-body {
  padding: 24px;
  flex: 1;
}

.sports-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.sport-tag {
  background: #f8f9fa;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 1.4rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.sport-tag:hover {
  background: #e9ecef;
  color: #333;
  transform: translateY(-2px);
}

.status-details {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  border-left: 4px solid;
}

.status-details .status-cleared {
  border-left-color: #198754;
}

.status-details .status-restricted {
  border-left-color: #ffc107;
}

.status-details .status-closed {
  border-left-color: #dc3545;
}

.status-message {
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 1.5;
}

.status-message i {
  margin-top: 2px;
  flex-shrink: 0;
}

.status-message i.bi-check-circle-fill {
  color: #198754;
}

.status-message i.bi-exclamation-triangle-fill {
  color: #ffc107;
}

.status-message i.bi-x-circle-fill {
  color: #dc3545;
}

.update-time {
  font-size: 1.4rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
}

.active-pilots-widget {
  background: linear-gradient(135deg, #e3fde9 0%, #7a9f80 100%);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  border: 2px solid #19875420;
}

.widget-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  color: darkgreen;
  font-size: 1.4rem;
}

.pilot-count {
  background: linear-gradient(135deg, #bfe9c9 0%, #6cac77 100%);
  color: white;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 1.4rem;
  font-weight: bold;
  margin-left: auto;
}

.pilots-visual {
  display: flex;
  margin-bottom: 10px;
  padding-left: 10px;
}

.pilot-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
  border: 3px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.widget-status {
  font-size: 1.4rem;
  color: #2d6a4f;
  text-align: center;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.qr-quick-access {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.qr-quick-access:hover {
  border-color: #0d6efd;
  background: #f0f8ff;
}

.qr-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qr-icon-container {
  width: 40px;
  height: 40px;
  background: #0d6efd;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
}

.qr-text {
  line-height: 1.4;
}

.qr-label {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2px;
}

.qr-code {
  font-weight: 700;
  color: #0d6efd;
  font-size: 1.2rem;
  letter-spacing: 1px;
  font-family: 'Courier New', monospace;
}

.qr-actions {
  display: flex;
  gap: 8px;
}

.btn-qr-action {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 2px solid #dee2e6;
  background: white;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.4rem;
}

.btn-qr-action:hover:not(:disabled) {
  border-color: darkgreen;
  background: darkgreen;
  color: white;
  transform: translateY(-2px);
}

.btn-qr-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quick-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.info-item {
  text-align: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.info-label {
  font-size: 1.4rem;
  color: #000;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.info-value {
  font-weight: 700;
  color: #333;
  font-size: 1.4rem;
}

.card-footer {
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.btn-view-details {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: transparent;
  border: 2px solid darkgreen;
  color: darkgreen;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 1.4rem;
}

.btn-view-details:hover {
  background: darkgreen;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 100, 0, 0.2);
}

.btn-checkin {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #198754;
  border: 2px solid #198754;
  color: white;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 1.4rem;
}

.btn-checkin:hover:not(.disabled) {
  background: #157347;
  border-color: #157347;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 135, 84, 0.2);
}

.btn-checkin.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #6c757d;
  border-color: #6c757d;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .location-name {
    font-size: 1.4rem;
  }
  
  .sports-tags {
    gap: 6px;
  }
  
  .sport-tag {
    font-size: 1.4rem;
    padding: 4px 10px;
  }
  
  .quick-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .card-header {
    padding: 16px;
  }
  
  .card-body {
    padding: 16px;
  }
  
  .footer-actions {
    flex-direction: column;
  }
  
  .quick-info-grid {
    grid-template-columns: 1fr;
  }
  
  .qr-quick-access {
    flex-direction: column;
    gap: 12px;
  }
  
  .qr-info {
    width: 100%;
    justify-content: center;
  }
}
</style>
<style scoped>
.enhanced-location-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 25px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  height: 100%;
  border: 1px solid #e9ecef;
}

.enhanced-location-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
  border-color: #0d6efd;
}

.card-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-header {
  padding: 24px;
  color: white;
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
  overflow: hidden;
  min-height: 100px;
}

.card-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.1) 0%, transparent 100%);
}

.card-header.status-cleared {
  background: linear-gradient(135deg, #198754 0%, #157347 100%);
}

.card-header.status-restricted {
  background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
}

.card-header.status-closed {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.status-indicator {
  position: relative;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.status-dot {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: white;
  position: relative;
  z-index: 2;
}

.status-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  opacity: 0.3;
  animation: statusPulse 2s infinite;
}

@keyframes statusPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.1;
  }
}

.header-content {
  flex: 1;
}

.location-name {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.location-region {
  font-size: 1.4rem;
  opacity: 0.9;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-actions {
  flex-shrink: 0;
}

.btn-favorite {
  background: rgba(255,255,255,0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  z-index: 2;
}

.btn-favorite:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.1);
}

.btn-favorite.favorited {
  background: rgba(255,255,255,0.3);
  color: #ffc107;
}

.btn-favorite.favorited:hover {
  background: rgba(255,255,255,0.4);
}

.card-body {
  padding: 24px;
  flex: 1;
}

.sports-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.sport-tag {
  background: #f8f9fa;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 1.4rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.sport-tag:hover {
  background: #e9ecef;
  color: #333;
  transform: translateY(-2px);
}

.status-details {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  border-left: 4px solid;
}

.status-details .status-cleared {
  border-left-color: #198754;
}

.status-details .status-restricted {
  border-left-color: #ffc107;
}

.status-details .status-closed {
  border-left-color: #dc3545;
}

.status-message {
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 1.5;
}

.status-message i {
  margin-top: 2px;
  flex-shrink: 0;
}

.status-message i.bi-check-circle-fill {
  color: #198754;
}

.status-message i.bi-exclamation-triangle-fill {
  color: #ffc107;
}

.status-message i.bi-x-circle-fill {
  color: #dc3545;
}

.update-time {
  font-size: 1.4rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
}

.active-pilots-widget {
  background: linear-gradient(135deg, #e3fde9 0%, #7a9f80 100%);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  border: 2px solid #19875420;
}

.widget-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  color: darkgreen;
  font-size: 1.4rem;
}

.pilot-count {
  background: linear-gradient(135deg, #bfe9c9 0%, #6cac77 100%);
  color: white;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 1.4rem;
  font-weight: bold;
  margin-left: auto;
}

.pilots-visual {
  display: flex;
  margin-bottom: 10px;
  padding-left: 10px;
}

.pilot-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
  border: 3px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.widget-status {
  font-size: 1.4rem;
  color: #2d6a4f;
  text-align: center;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.qr-quick-access {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.qr-quick-access:hover {
  border-color: #0d6efd;
  background: #f0f8ff;
}

.qr-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qr-icon-container {
  width: 40px;
  height: 40px;
  background: #0d6efd;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
}

.qr-text {
  line-height: 1.4;
}

.qr-label {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2px;
}

.qr-code {
  font-weight: 700;
  color: #0d6efd;
  font-size: 1.2rem;
  letter-spacing: 1px;
  font-family: 'Courier New', monospace;
}

.qr-actions {
  display: flex;
  gap: 8px;
}

.btn-qr-action {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 2px solid #dee2e6;
  background: white;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.4rem;
}

.btn-qr-action:hover:not(:disabled) {
  border-color: darkgreen;
  background: darkgreen;
  color: white;
  transform: translateY(-2px);
}

.btn-qr-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quick-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.info-item {
  text-align: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.info-label {
  font-size: 1.4rem;
  color: #000;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.info-value {
  font-weight: 700;
  color: #333;
  font-size: 1.4rem;
}

.card-footer {
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.btn-view-details {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: transparent;
  border: 2px solid darkgreen;
  color: darkgreen;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 1.4rem;
}

.btn-view-details:hover {
  background: darkgreen;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 100, 0, 0.2);
}

.btn-checkin {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #198754;
  border: 2px solid #198754;
  color: white;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 1.4rem;
}

.btn-checkin:hover:not(.disabled) {
  background: #157347;
  border-color: #157347;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 135, 84, 0.2);
}

.btn-checkin.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #6c757d;
  border-color: #6c757d;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .location-name {
    font-size: 1.4rem;
  }
  
  .sports-tags {
    gap: 6px;
  }
  
  .sport-tag {
    font-size: 1.4rem;
    padding: 4px 10px;
  }
  
  .quick-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .card-header {
    padding: 16px;
  }
  
  .card-body {
    padding: 16px;
  }
  
  .footer-actions {
    flex-direction: column;
  }
  
  .quick-info-grid {
    grid-template-columns: 1fr;
  }
  
  .qr-quick-access {
    flex-direction: column;
    gap: 12px;
  }
  
  .qr-info {
    width: 100%;
    justify-content: center;
  }
}
</style>