<template>
  <div class="events-section pb-120 pt-5 mt-5">
    <div class="container">
      <div class="row justify-content-center mb-5">
        <div class="col-lg-10 col-md-12 text-center">
          <div class="section-title4 sibling3">
            <h2 class="fw-bold">Upcoming Events</h2>
            <p class="text-muted">Join the LASF in the skies of Lebanon</p>
          </div>
        </div>
      </div>

      <div class="row g-4 justify-content-center">
        <div v-for="event in events" :key="event.id" class="col-lg-4 col-md-6">
          <div class="modern-event-card">
            <div class="image-container">
              <div class="floating-date">
                <span class="day">{{ getDay(event.start_date || event.created_at) }}</span>
                <span class="month">{{ getMonth(event.start_date || event.created_at) }}</span>
              </div>
              
              <img 
                :src="`${config.public.mediaBase}${event.image}`" 
                class="event-main-img" 
                :alt="event.title"
                @error="handleImageError"
              >
              
              <div class="status-badge">Official Event</div>
            </div>

            <div class="content-wrap">
              <h5 class="event-name">
                <NuxtLink :to="`/events/${event.slug || event.id}`">{{ event.title }}</NuxtLink>
              </h5>
              <p class="event-desc text-muted">
                {{ truncateText(event.description, 90) }}
              </p>
    
            </div>
          </div>
        </div>

        <div v-if="!events?.length" class="text-center py-5">
          <i class="bi bi-calendar4-week display-1 text-light mb-3"></i>
          <p class="text-muted">No events currently scheduled. Check back soon!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const { data: events } = await useFetch(`${config.public.apiBase}/events`)

// Date Helpers
const getDay = (date) => new Date(date).getDate()
const getMonth = (date) => new Date(date).toLocaleString('en-LB', { month: 'short' }).toUpperCase()

const handleImageError = (e) => {
  e.target.src = '/assets/images/placeholder.png'
}

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}
</script>

<style scoped>
.modern-event-card {
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.modern-event-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(15, 104, 71, 0.12);
}

.image-container {
  position: relative;
  height: 260px;
  overflow: hidden;
}

.event-main-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.modern-event-card:hover .event-main-img {
  transform: scale(1.1);
}

/* Floating Date Box Styling */
.floating-date {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 3;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 10px 15px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  min-width: 65px;
}

.floating-date .day {
  display: block;
  font-size: 12px;
  font-weight: 800;
  color: #0f6847; /* LASF Green */
  line-height: 1;
}

.floating-date .month {
  font-size: 12px;
  font-weight: 700;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.status-badge {
  position: absolute;
  bottom: 15px;
  right: 15px;
  background: rgba(15, 104, 71, 0.85);
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  z-index: 2;
}

.content-wrap {
  padding: 25px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.event-name a {
  text-decoration: none;
  color: #1a1a1a;
  font-weight: 700;
  font-size: 1.6rem;
  transition: color 0.3s;
}

.modern-event-card:hover .event-name a {
  color: #0f6847;
}

.event-desc {
  font-size: 0.9rem;
  line-height: 1.6;
  margin-top: 10px;
}

.card-footer-action {
  margin-top: auto;
  padding-top: 15px;
}

.btn-link {
  text-decoration: none;
  color: #0f6847;
  font-weight: 700;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  transition: all 0.3s;
}

.btn-link:hover {
  gap: 10px;
}
</style>