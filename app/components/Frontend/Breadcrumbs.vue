<template>
    <div class="inner-banner-section" :style="backgroundStyle">
        <!-- Background Vector -->
        <img v-if="showVector" src="/assets/images/bg/inner-banner-vctr.png" class="inner-banner-vector" alt="banner-vector">
        
        <!-- Optional Background Overlay -->
        <div v-if="showOverlay" class="banner-overlay" :style="{ opacity: overlayOpacity }"></div>
        
        <div class="container" :style="containerStyle">
            <div class="row justify-content-center align-items-center">
                <div :class="contentColumnClasses">
                    <!-- Breadcrumb Navigation -->
                    <nav v-if="showBreadcrumb" aria-label="breadcrumb" class="breadcrumb-nav mb-3">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item">
                                <NuxtLink to="/" class="breadcrumb-link">
                                  Home
                                </NuxtLink>
                            </li>
                            <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
                                <li 
                                    class="breadcrumb-item" 
                                    :class="{ 'active': index === breadcrumbs.length - 1 }"
                                    :aria-current="index === breadcrumbs.length - 1 ? 'page' : null"
                                >
                                    <NuxtLink 
                                        v-if="index < breadcrumbs.length - 1" 
                                        :to="crumb.path" 
                                        class="breadcrumb-link"
                                    >
                                        {{ crumb.label }}
                                    </NuxtLink>
                                    <span v-else class="breadcrumb-text">
                                        {{ crumb.label }}
                                    </span>
                                </li>
                            </template>
                        </ol>
                    </nav>
                    
        
                </div>
            </div>
        </div>
        
        <!-- Optional Scroll Indicator -->
        <div v-if="showScrollIndicator" class="scroll-indicator" @click="scrollToContent">
            <i class="bi bi-chevron-down"></i>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from '#imports';

const route = useRoute();

// Props for customization
const props = defineProps({
  backgroundImage: {
    type: String,
    default: '/assets/images/bg/inner-banner-bg.png'
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: '260px'
  },
  showVector: {
    type: Boolean,
    default: true
  },
  showOverlay: {
    type: Boolean,
    default: false
  },
  overlayOpacity: {
    type: Number,
    default: 0.5
  },
  showCta: {
    type: Boolean,
    default: false
  },
  ctaButtons: {
    type: Array,
    default: () => []
  },
  contentWidth: {
    type: String,
    default: 'col-xl-12 col-md-12 col-sm-12',
    validator: (value) => {
      const validClasses = [
        'col-xl-6', 'col-xl-8', 'col-xl-10', 'col-lg-8', 
        'col-md-10', 'col-sm-12', 'col-12'
      ];
      return value.split(' ').every(cls => validClasses.includes(cls));
    }
  },
  alignment: {
    type: String,
    default: 'center',
    validator: (value) => ['left', 'center', 'right'].includes(value)
  },
  showBreadcrumb: {
    type: Boolean,
    default: true
  },
  showStats: {
    type: Boolean,
    default: false
  },
  stats: {
    type: Array,
    default: () => []
  },
  iconClass: {
    type: String,
    default: ''
  },
  showScrollIndicator: {
    type: Boolean,
    default: false
  },
  gradientOverlay: {
    type: Boolean,
    default: true
  },
  gradientDirection: {
    type: String,
    default: 'to bottom',
    validator: (value) => ['to bottom', 'to top', 'to left', 'to right', 'diagonal'].includes(value)
  }
});

// Page-specific data mapping
const pageData = {
  '/': {
    title: 'Home',
    subtitle: 'Welcome to',
    description: '',
    icon: 'bi bi-house-heart'
  },
  '/about': {
    title: 'About',
    subtitle: 'Who We Are',
    description: 'Learn more about our organization, mission, and values that drive us forward in the aviation sports industry.',
    icon: 'bi bi-info-circle'
  },
  '/locations': {
    title: 'Flying Locations',
    subtitle: 'Explore Our Sites',
    description: 'Discover the best flying locations across the country with detailed information and guidelines.',
    icon: 'bi bi-geo-alt'
  },
  '/sports': {
    title: 'Sports',
    subtitle: 'Aviation Sports',
    description: 'Explore various aviation sports we promote and support including paragliding, hang gliding, and more.',
    icon: 'bi bi-airplane'
  },
  '/regulations': {
    title: 'Regulations',
    subtitle: 'Guidelines & Rules',
    description: 'Important regulations and safety guidelines for all aviation sports activities.',
    icon: 'bi bi-shield-check'
  },
  '/clubs': {
    title: 'Clubs',
    subtitle: 'Join Our Network',
    description: 'Find and connect with aviation sports clubs and communities across the country.',
    icon: 'bi bi-people'
  },
  '/events': {
    title: 'Events',
    subtitle: 'Upcoming Activities',
    description: 'Stay updated with upcoming events, competitions, and gatherings in the aviation sports community.',
    icon: 'bi bi-calendar-event'
  },
  '/gallery': {
    title: 'Gallery',
    subtitle: 'Our Gallery',
    description: 'Browse through our collection of best images and videos from aviation sports events.',
    icon: 'bi bi-images'
  },
  '/news': {
    title: 'News',
    subtitle: 'Latest News',
    description: 'Latest news, articles, and updates from the aviation sports world.',
    icon: 'bi bi-newspaper'
  },
  '/contact': {
    title: 'Contact',
    subtitle: 'Get in Touch',
    description: 'Reach out to us for inquiries, partnerships, membership, or any other information.',
    icon: 'bi bi-envelope'
  }
};

// Get page-specific data
const pageInfo = computed(() => {
  const currentPath = route.path;
  const data = pageData[currentPath] || {};
  
  return {
    title: props.title || data.title || getMenuName(currentPath),
    subtitle: props.subtitle || data.subtitle || '',
    description: props.description || data.description || breadcrumbDescription.value,
    iconClass: props.iconClass || data.icon || ''
  };
});

// Helper function to get menu name
const getMenuName = (path) => {
  const menuMap = {
    '/about': 'About LASF',
    '/locations': 'Flying Locations',
    '/sports': 'Sports',
    '/regulations': 'Regulations',
    '/clubs': 'Clubs',
    '/events': 'Events',
    '/gallery': 'Gallery',
    '/news': 'News',
    '/contact': 'Contact'
  };
  
  return menuMap[path] || toStartCase(path.replace('/', ''));
};

// Helper function to convert to start case
const toStartCase = (str) => {
  if (!str) return '';
  return str.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

// Get page description
const breadcrumbDescription = computed(() => {
  if (props.description) return props.description;
  
  const currentPath = route.path;
  const descriptions = {
    '/about': 'Learn more about our organization, mission, and values that drive us forward.',
    '/locations': 'Explore flying locations with detailed information and guidelines.',
    '/sports': 'Discover various aviation sports we promote and support.',
    '/regulations': 'Important regulations and safety guidelines for aviation sports.',
    '/clubs': 'Find and connect with aviation sports clubs and communities.',
    '/events': 'Stay updated with upcoming events and competitions.',
    '/gallery': 'Browse our collection of images and videos from aviation sports.',
    '/news': 'Latest news, articles, and updates from aviation sports.',
    '/contact': 'Reach out to us for inquiries, partnerships, or information.'
  };
  
  return descriptions[currentPath] || 'Explore our content and services.';
});

// Breadcrumbs computation
const breadcrumbs = computed(() => {
  const pathSegments = route.fullPath.split('/').filter(Boolean);
  
  const trail = pathSegments.reduce((acc, segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = getMenuName(path);
    
    acc.push({
      label: label,
      path: path,
    });
    return acc;
  }, []);
  
  return trail;
});

// Dynamic content column classes
const contentColumnClasses = computed(() => {
  const baseClasses = props.contentWidth.split(' ');
  const alignmentClass = `text-${props.alignment}`;
  return [...baseClasses, alignmentClass];
});

// Stats column class based on number of stats
const statColumnClass = computed(() => {
  const count = props.stats.length;
  if (count <= 2) return 'col-md-6 col-6';
  if (count <= 4) return 'col-md-3 col-6';
  return 'col-md-2 col-6';
});

// Background style with gradient
const backgroundStyle = computed(() => {
  const gradient = props.gradientOverlay 
    ? getGradientStyle(props.gradientDirection)
    : '';
  
  return {
    backgroundImage: `${gradient}url('${props.backgroundImage}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    height: props.height,
    minHeight: props.height
  };
});

// Container style
const containerStyle = computed(() => {
  return {
    minHeight: props.height,
    display: 'flex',
    alignItems: props.alignment === 'center' ? 'center' : 'flex-start',
    justifyContent: props.alignment === 'center' ? 'center' : props.alignment === 'right' ? 'flex-end' : 'flex-start'
  };
});

// Helper function for gradient direction
const getGradientStyle = (direction) => {
  const gradients = {
    'to bottom': 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 100%)',
    'to top': 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 100%)',
    'to left': 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 100%)',
    'to right': 'linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 100%)',
    'diagonal': 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 100%)'
  };
  return gradients[direction] || gradients['to bottom'];
};

// Emits for custom events
const emit = defineEmits(['cta-click', 'scroll-to-content']);

// Methods
const scrollToContent = () => {
  emit('scroll-to-content');
  const contentElement = document.querySelector('.main-content') || document.querySelector('main');
  if (contentElement) {
    contentElement.scrollIntoView({ behavior: 'smooth' });
  }
};

// Handle CTA button click
const handleCtaClick = (action) => {
  if (typeof action === 'function') {
    action();
  }
  emit('cta-click');
};
</script>

<style scoped>
/* Base Styles */
.inner-banner-section {
  position: relative;
  color: white;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.inner-banner-vector {
  position: absolute;
  bottom: 0;
  right: 0;
  max-height: 100%;
  opacity: 0.8;
  z-index: 1;
  pointer-events: none;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.inner-banner-section > .container {
  position: relative;
  z-index: 2;
  width: 100%;
}

/* Breadcrumb Styles */
.breadcrumb-nav {
  margin-bottom: 1rem;
}

.breadcrumb {
  background: transparent;
  margin-bottom: 0;
  padding: 0;
  display: flex;
  flex-wrap: inherit;
}

.breadcrumb-item {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.6rem;
  display: flex;
  align-items: center;
}

.breadcrumb-item + .breadcrumb-item::before {
  color: rgba(255, 255, 255, 0.6);
  content: "/";
  padding: 0 0.5rem;
}

.breadcrumb-item.active {
  color: white;
  font-weight: 500;
}

.breadcrumb-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.breadcrumb-link:hover {
  color: white;
  text-decoration: underline;
}

.breadcrumb-text {
  color: white;
}

/* Banner Content Styles */
.breadcrumb-area {
  padding: 2rem;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.breadcrumb-subtitle {
  display: inline-block;
  font-size: 0.9rem;
  color: #ffd700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 4px;
}

.page-title {
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.page-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin: 0 auto;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Banner Icon */
.banner-icon {
  font-size: 3rem;
  color: #ffd700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* CTA Buttons */
.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

.cta-buttons .btn {
  padding: 0.875rem 2rem;
  font-weight: 500;
  border-radius: 30px;
  transition: all 0.3s;
  border: none;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px;
}

.cta-buttons .btn-primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

.cta-buttons .btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.4);
}

.cta-buttons .btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid white;
  color: white;
  backdrop-filter: blur(5px);
}

.cta-buttons .btn-secondary:hover {
  background: white;
  color: #333;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.2);
}

/* Stats Section */
.banner-stats {
  margin-top: 2rem;
}

.banner-stats .row {
  justify-content: center;
}

.stat-item {
  text-align: center;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.1);
  height: 100%;
}

.stat-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.stat-number {
  font-size: 2.2rem;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 0.5rem;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

/* Scroll Indicator */
.scroll-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 1.5rem;
  animation: bounce 2s infinite;
  cursor: pointer;
  z-index: 3;
  background: rgba(0, 0, 0, 0.4);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.scroll-indicator:hover {
  background: rgba(0, 0, 0, 0.6);
  transform: translateX(-50%) scale(1.1);
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-10px);
  }
  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}

/* Responsive Styles */

/* Tablet and below */
@media (max-width: 991.98px) {
  .inner-banner-section {
    padding: 2rem 0;
  }
  
  .page-title {
    font-size: 2.4rem;
  }
  
  .page-description {
    font-size: 1.05rem;
  }
  
  .breadcrumb-area {
    padding: 1.75rem;
  }
  
  .banner-icon {
    font-size: 2.5rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
}

/* Mobile Landscape */
@media (max-width: 767.98px) {
  .inner-banner-section {
    min-height: 240px !important;
    height: auto !important;
    padding: 1.5rem 0;
  }
  
  .page-title {
    font-size: 2rem;
    margin-bottom: 0.75rem;
  }
  
  .page-description {
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 1rem;
  }
  
  .breadcrumb-area {
    padding: 1.5rem;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }
  
  .breadcrumb-subtitle {
    font-size: 0.85rem;
    padding: 0.2rem 0.6rem;
  }
  
  .banner-icon {
    font-size: 2rem;
    margin-bottom: 0.75rem;
  }
  
  .cta-buttons {
    gap: 0.75rem;
    margin-top: 1rem;
  }
  
  .cta-buttons .btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.95rem;
    min-height: 44px;
    width: 100%;
    max-width: 280px;
  }
  
  .breadcrumb-nav {
    margin-bottom: 0.75rem;
  }
  
  .breadcrumb-item {
    font-size: 1.2rem;
  }
  
  .inner-banner-vector {
    max-height: 80%;
    opacity: 0.6;
  }
  
  .scroll-indicator {
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
    bottom: 20px;
  }
}

/* Small Mobile */
@media (max-width: 575.98px) {
  .inner-banner-section {
    padding: 1rem 0;
    min-height: 200px !important;
  }
  
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .page-title {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }
  
  .page-description {
    font-size: 0.95rem;
    line-height: 1.4;
  }
  
  .breadcrumb-area {
    padding: 1.25rem;
    border-radius: 8px;
  }
  
  .breadcrumb-subtitle {
    font-size: 0.8rem;
    margin-bottom: 0.4rem;
  }
  
  .banner-icon {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .cta-buttons .btn {
    max-width: 100%;
  }
  
  .breadcrumb {
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  .breadcrumb-item {
    font-size: 1.6rem;
  }
  
  .breadcrumb-item + .breadcrumb-item::before {
    padding: 0 0.3rem;
  }
  
  .breadcrumb-link i {
    font-size: 0.9rem;
  }
  
  /* Stats Section - Mobile */
  .banner-stats .row {
    margin-left: -0.25rem;
    margin-right: -0.25rem;
  }
  
  .banner-stats .row > div {
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }
  
  .stat-item {
    padding: 1rem 0.75rem;
    border-radius: 8px;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .stat-label {
    font-size: 0.8rem;
  }
  
  .scroll-indicator {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
    bottom: 15px;
  }
  
  /* Hide vector on very small screens */
  .inner-banner-vector {
    display: none;
  }
}

/* Extra Small Mobile */
@media (max-width: 375px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .page-description {
    font-size: 0.9rem;
  }
  
  .breadcrumb-area {
    padding: 1rem;
  }
  
  .breadcrumb-item {
    font-size: 0.75rem;
  }
  
  .cta-buttons .btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.9rem;
  }
}

/* Height-specific adjustments for very tall banners */
@media (min-height: 800px) and (max-width: 767px) {
  .inner-banner-section {
    min-height: 280px !important;
  }
  
  .page-title {
    font-size: 2.2rem;
  }
  
  .page-description {
    font-size: 1.1rem;
  }
}

/* Landscape Mode */
@media (max-height: 500px) and (orientation: landscape) {
  .inner-banner-section {
    min-height: 180px !important;
    padding: 0.75rem 0;
  }
  
  .page-title {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }
  
  .page-description {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .breadcrumb-area {
    padding: 0.75rem;
  }
  
  .breadcrumb-nav {
    margin-bottom: 0.25rem;
  }
}

/* Print Styles */
@media print {
  .inner-banner-section {
    background: white !important;
    color: black !important;
    min-height: auto !important;
    height: auto !important;
  }
  
  .breadcrumb-area {
    background: white !important;
    color: black !important;
    border: 1px solid #ddd;
  }
  
  .page-title,
  .page-description,
  .breadcrumb-text,
  .breadcrumb-link,
  .breadcrumb-item {
    color: black !important;
  }
  
  .inner-banner-vector,
  .scroll-indicator,
  .banner-overlay {
    display: none !important;
  }
}
</style>