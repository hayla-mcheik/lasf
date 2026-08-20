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
                                     {{ decodeURIComponent(crumb.label) }}
                                    </NuxtLink>
                                    <span v-else class="breadcrumb-text">
                                     {{ decodeURIComponent(crumb.label) }}
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
import { computed } from 'vue'
import { useRoute } from '#imports'

const route = useRoute()

const props = defineProps({
  parent: {
    type: String,
    default: ''
},

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
        default: 'col-xl-12 col-md-12 col-sm-12'
    },
    alignment: {
        type: String,
        default: 'center'
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
        default: 'to bottom'
    }
})

const pageData = {

    '/': {
        title: 'Home',
        subtitle: 'Welcome',
        icon: 'bi bi-house'
    },

    '/about': {
        title: 'About Us',
        subtitle: 'About LASF',
        icon: 'bi bi-info-circle'
    },

    '/location': {
        title: 'Flying Locations',
        subtitle: 'Flying Locations',
        icon: 'bi bi-geo-alt'
    },

    '/sports': {
        title: 'Sports',
        subtitle: 'Sports',
        icon: 'bi bi-airplane'
    },

    '/events': {
        title: 'Events',
        subtitle: 'Events',
        icon: 'bi bi-calendar-event'
    },

    '/gallery': {
        title: 'Gallery',
        subtitle: 'Gallery',
        icon: 'bi bi-images'
    },

    '/news': {
        title: 'News',
        subtitle: 'News',
        icon: 'bi bi-newspaper'
    },

    '/contact': {
        title: 'Contact Us',
        subtitle: 'Contact',
        icon: 'bi bi-envelope'
    }

}

const menuMap = {

    home: 'Home',

    about: 'About Us',

    location: 'Flying Locations',

    locations: 'Flying Locations',

    sports: 'Sports',

    regulations: 'Regulations',

    clubs: 'Clubs',

    events: 'Events',

    gallery: 'Gallery',

    news: 'News',

    contact: 'Contact Us',

    login: 'Login',

    register: 'Register',

    account: 'My Account',

    admin: 'Dashboard'

}

const toStartCase = (text) => {

    if (!text) return ''

    return text
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())

}

const pageInfo = computed(() => {

    const firstSegment =
        '/' + (route.path.split('/').filter(Boolean)[0] || '')

    const page = pageData[firstSegment] || {}

    return {

        title:
            props.title ||
            page.title ||
            'LASF',

        subtitle:
            props.subtitle ||
            page.subtitle ||
            '',

        description:
            props.description ||
            '',

        iconClass:
            props.iconClass ||
            page.icon ||
            ''

    }

})

const breadcrumbs = computed(() => {

    const items = []

    items.push({
        label: 'Home',
        path: '/'
    })

    if (props.parent) {

        items.push({
            label: props.parent,
            path: '/' + route.path.split('/')[1]
        })

    }

    if (props.title) {

        items.push({
            label: props.title,
            path: route.path
        })

        return items

    }

    const segments = route.path.split('/').filter(Boolean)

    segments.forEach((segment, index) => {

        items.push({

            label: menuMap[segment] || toStartCase(segment),

            path:
                '/' +
                segments.slice(0, index + 1).join('/')

        })

    })

    return items

})
// Dynamic content column classes
const contentColumnClasses = computed(() => {

    const baseClasses = props.contentWidth.split(' ')

    return [
        ...baseClasses,
        `text-${props.alignment}`
    ]

})

// Stats column
const statColumnClass = computed(() => {

    const count = props.stats.length

    if (count <= 2) return 'col-md-6 col-6'

    if (count <= 4) return 'col-md-3 col-6'

    return 'col-md-2 col-6'

})

// Description
const breadcrumbDescription = computed(() => {

    if (props.description) {

        return props.description

    }

    const descriptions = {

        '/about':
            'Learn more about our organization and mission.',

        '/location':
            'Explore our flying locations.',

        '/sports':
            'Discover aviation sports.',

        '/events':
            'Upcoming events and competitions.',

        '/gallery':
            'Browse our image gallery.',

        '/news':
            'Latest aviation news.',

        '/contact':
            'Get in touch with LASF.'

    }

    const firstSegment =
        '/' + (route.path.split('/').filter(Boolean)[0] || '')

    return descriptions[firstSegment] || ''

})

// Background
const backgroundStyle = computed(() => {

    const gradient = props.gradientOverlay
        ? getGradientStyle(props.gradientDirection)
        : ''

    return {

        backgroundImage:
            `${gradient}url('${props.backgroundImage}')`,

        backgroundSize: 'cover',

        backgroundPosition: 'center',

        backgroundRepeat: 'no-repeat',

        height: props.height,

        minHeight: props.height

    }

})

// Container
const containerStyle = computed(() => ({

    minHeight: props.height,

    display: 'flex',

    alignItems:
        props.alignment === 'center'
            ? 'center'
            : 'flex-start',

    justifyContent:
        props.alignment === 'center'
            ? 'center'
            : props.alignment === 'right'
                ? 'flex-end'
                : 'flex-start'

}))

// Gradient helper
const getGradientStyle = (direction) => {

    const gradients = {

        'to bottom':
            'linear-gradient(to bottom, rgba(0,0,0,.45), rgba(0,0,0,.15)),',

        'to top':
            'linear-gradient(to top, rgba(0,0,0,.45), rgba(0,0,0,.15)),',

        'to left':
            'linear-gradient(to left, rgba(0,0,0,.45), rgba(0,0,0,.15)),',

        'to right':
            'linear-gradient(to right, rgba(0,0,0,.45), rgba(0,0,0,.15)),',

        diagonal:
            'linear-gradient(135deg, rgba(0,0,0,.45), rgba(0,0,0,.15)),'
    }

    return gradients[direction] || gradients['to bottom']

}

const emit = defineEmits([
    'cta-click',
    'scroll-to-content'
])

const scrollToContent = () => {

    emit('scroll-to-content')

    const target =
        document.querySelector('.main-content') ||
        document.querySelector('main')

    if (target) {

        target.scrollIntoView({

            behavior: 'smooth'

        })

    }

}

const handleCtaClick = (action) => {

    if (typeof action === 'function') {

        action()

    }

    emit('cta-click')

}
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