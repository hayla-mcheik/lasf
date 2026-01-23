<template>
  <div class="news-feed-wrapper">
    <div v-if="pending" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
    
    <div v-else-if="news && news.length > 0" class="news-list">
      <div v-for="(item, index) in news" :key="item.id" class="news-item-row" @click="openNewsDetail(item)">
        
        <div class="status-col">
          <div class="icon-box" :style="{ 
            backgroundColor: getCategoryColor(item.categories?.[0]?.name) + '20', 
            color: getCategoryColor(item.categories?.[0]?.name) 
          }">
            <i class="bi" :class="getCategoryIcon(item.categories?.[0]?.name)"></i>
          </div>
          <div v-if="index !== news.length - 1" class="v-line"></div>
        </div>

        <div class="content-col">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="badge-category text-uppercase fw-bold" :style="{ color: getCategoryColor(item.categories?.[0]?.name) }">
              {{ item.categories?.[0]?.name || 'Notice' }}
            </span>
            <span class="time-stamp small">{{ formatTime(item.published_at || item.created_at) }}</span>
          </div>
          
          <h5 class="news-title">{{ item.title }}</h5>
          <p class="news-excerpt">{{ item.content }}</p>
          
          <div v-if="getLocations(item).length > 0" class="location-tags-row mt-3">
             <div class="d-flex align-items-center flex-wrap gap-2">
                <span class="loc-label"><i class="bi bi-geo-alt-fill me-1"></i> Area:</span>
                <span v-for="loc in getLocations(item)" :key="loc.id || loc" class="loc-tag">
                  {{ loc.name || loc }}
                </span>
             </div>
          </div>
        </div>

        <div class="action-col ps-2">
          <i class="bi bi-chevron-right opacity-50"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();

const { data: news, pending, error } = await useFetch(`${config.public.apiBase}/news`, {
  key: 'flight-news-final',
  transform: (res) => res.data || res 
});

// Helper function to handle both camelCase and snake_case from API
const getLocations = (item) => {
  return item.affected_locations || item.affectedLocations || [];
};

// UI Helpers
const getCategoryColor = (name) => {
  const map = { 'Clearance': '#198754', 'Weather': '#0dcaf0', 'Restriction': '#dc3545', 'Notice': '#ffc107' };
  return map[name] || '#6c757d';
};

const getCategoryIcon = (name) => {
  const map = { 'Clearance': 'bi-check-circle-fill', 'Weather': 'bi-cloud-sun-fill', 'Restriction': 'bi-exclamation-triangle-fill', 'Notice': 'bi-info-circle' };
  return map[name] || 'bi-megaphone';
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const openNewsDetail = (item) => navigateTo(`/news/${item.slug}`);
</script>

<style scoped>
.news-feed-wrapper { background: #fff; border-radius: 16px; }
.news-item-row { display: flex; gap: 15px; padding: 20px; border-bottom: 1px solid #f0f0f0; cursor: pointer; transition: 0.2s; }
.news-item-row:hover { background: #fafafa; }
.status-col { display: flex; flex-direction: column; align-items: center; width: 45px; }
.icon-box { width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
.v-line { width: 2px; flex: 1; background: #eee; margin-top: 10px; }
.content-col { flex: 1; }
.news-title { font-size: 1.6rem; font-weight: 700; margin-bottom: 5px; color: #111; }
.news-excerpt { font-size: 1.4rem; color: #555; line-height: 1.5; margin-bottom: 0; }

/* Location Styling */
.location-tags-row {
  background: #fdfdfd;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px dashed #ddd;
}
.loc-label { font-size: 1.4rem; font-weight: 700; color: #444; }
.loc-tag { 
  background: #fff; 
  padding: 2px 10px; 
  border-radius: 6px; 
  font-size: 1.4rem; 
  font-weight: 600; 
  color: #dc3545; 
  border: 1px solid #eee;
  box-shadow: 0 2px 4px rgba(0,0,0,0.03);
}
</style>