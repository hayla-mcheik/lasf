<template>
  <div class="regulations-page pt-120 pb-120">
    <div class="container">
      <div class="row justify-content-center mb-5">
        <div class="col-lg-8 text-center">
          <div class="section-title4">
            <h2 class="fw-bold">Regulations & Safety</h2>
            <p class="text-muted">The Lebanese Aero Sport Federation (LASF) maintains strict safety standards to ensure the well-being of all pilots and enthusiasts.</p>
          </div>
        </div>
      </div>

      <div class="row g-5">
        <div class="col-lg-4">
          <div class="sticky-sidebar">
            <div class="list-group shadow-sm border-0">
              <div class="list-group-item bg-dark text-white fw-bold py-3 border-0">
                Categories
              </div>
              <a 
                v-for="(rules, category) in groupedRegulations" 
                :key="category" 
                :href="`#cat-${category.replace(/\s+/g, '-').toLowerCase()}`"
                class="list-group-item list-group-item-action border-0 py-3"
              >
                <i class="bi bi-shield-check me-2 text-primary"></i> {{ category }}
                <span class="badge rounded-pill bg-light text-dark float-end">{{ rules.length }}</span>
              </a>
            </div>
            
            <div class="alert alert-warning mt-4 border-0 shadow-sm">
              <h6 class="fw-bold"><i class="bi bi-info-circle-fill me-2"></i> Safety First</h6>
              <small>All pilots are required to follow these regulations during flight activities in Lebanese airspace.</small>
            </div>
          </div>
        </div>

        <div class="col-lg-8">
          <div v-if="groupedRegulations && Object.keys(groupedRegulations).length > 0">
            <div 
              v-for="(rules, category) in groupedRegulations" 
              :key="category" 
              :id="`cat-${category.replace(/\s+/g, '-').toLowerCase()}`"
              class="category-block mb-5"
            >
              <h3 class="category-title mb-4">{{ category }}</h3>
              
              <div class="rules-stack">
                <div 
                  v-for="rule in rules" 
                  :key="rule.id" 
                  class="rule-card mb-3" 
                  :class="{ 'is-critical': rule.is_critical }"
                >
                  <div class="rule-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">{{ rule.title }}</h5>
                    <span v-if="rule.is_critical" class="badge bg-danger pulse-animation">
                      <i class="bi bi-exclamation-triangle-fill me-1"></i> CRITICAL
                    </span>
                  </div>
                  <div class="rule-content mt-2">
                    {{ rule.content }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-3 text-muted">Loading federation guidelines...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()

// Use the public endpoint that groups by category
const { data: groupedRegulations } = await useFetch(`${config.public.apiBase}/regulations`)
</script>

<style scoped>
.sticky-sidebar {
  position: sticky;
  top: 100px;
}

.category-title {
  font-weight: 800;
  color: #1a1a1a;
  border-left: 5px solid #0f6847;
  padding-left: 15px;
  text-transform: capitalize;
}

/* Rule Card Styling */
.rule-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #eee;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
  transition: all 0.3s ease;
}

.rule-card:hover {
  border-color: #0f6847;
  transform: translateX(5px);
}

.rule-card.is-critical {
  border-left: 5px solid #dc3545;
  background: #fff8f8;
}

.rule-header h5 {
  font-weight: 700;
  font-size: 1.1rem;
}

.rule-content {
  color: #555;
  line-height: 1.6;
  white-space: pre-line;
}

/* Pulse animation for critical rules */
.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

.list-group-item.active {
  background-color: #0f6847;
}
</style>