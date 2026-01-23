<template>
  <NuxtLink
    :to="to"
    class="nav-item"
    :class="{ 'active': active, 'collapsed': collapsed }"
  >
    <div class="nav-icon">
      <i :class="icon"></i>
    </div>
    <span v-if="!collapsed" class="nav-label">{{ label }}</span>
    <div v-if="!collapsed && badge" class="nav-badge">
      {{ badge }}
    </div>
  </NuxtLink>
</template>

<script setup>
defineProps({
  active: Boolean,
  collapsed: Boolean,
  icon: String,
  label: String,
  to: String,
  badge: [String, Number]
})
</script>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.nav-item:hover {
  background: rgba(255,255,255,0.1);
  color: white;
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(52, 152, 219, 0.2) 0%, rgba(52, 152, 219, 0.1) 100%);
  color: white;
  border-right: 3px solid #3498db;
}

.nav-item.collapsed {
  justify-content: center;
  padding: 15px;
}

.nav-icon {
  font-size: 1.4rem;
  min-width: 24px;
}

.nav-label {
  margin-left: 15px;
  flex: 1;
  font-size: 1.6rem;
  font-weight: 500;
}

.nav-badge {
  background: #e74c3c;
  color: white;
  font-size: 1.4rem;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 10px;
}

.nav-item.collapsed .nav-label,
.nav-item.collapsed .nav-badge {
  display: none;
}
</style>