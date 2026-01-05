<!-- components/Frontend/TheHeader.vue -->
<template>
    <header class="header-area style-2">
        <div class="container d-flex justify-content-between align-items-center">
            <div class="header-logo">
                <NuxtLink to="/"><img alt="image" class="img-fluid" src="/assets/images/icons/logo.png"></NuxtLink>
            </div>
            
            <!-- Desktop Navigation -->
            <div class="main-nav d-lg-block d-none">
                <ul class="menu-list">
                    <li>
                        <NuxtLink to="/" class="drop-down" :class="{ 'active': $route.path === '/' }">Home</NuxtLink>
                    </li>
                    
                    <!-- Flying Locations -->
                    <li>
                        <NuxtLink to="/flyinglocations" class="drop-down" :class="{ 'active': $route.path === '/flyinglocations' }">Flying Locations</NuxtLink>
                    </li>
                    
                    <!-- About LASF Dropdown -->
                    <li class="menu-item-has-children">
                        <NuxtLink to="#" class="drop-down" :class="{ 'active': $route.path.includes('/about') || $route.path.includes('/gallery') || $route.path.includes('/regulations') }">
                            About LASF <i class="bi bi-chevron-down dropdown-icon"></i>
                        </NuxtLink>
                        <ul class="sub-menu">
                            <li><NuxtLink to="/about" :class="{ 'active': $route.path === '/about' }">About Us</NuxtLink></li>
                            <li><NuxtLink to="/gallery" :class="{ 'active': $route.path === '/gallery' }">Gallery</NuxtLink></li>
                            <li><NuxtLink to="/pilots" :class="{ 'active': $route.path === '/pilots' }">Pilots</NuxtLink></li>
                            <li><NuxtLink to="/regulations" :class="{ 'active': $route.path === '/regulations' }">Regulations</NuxtLink></li>
                        </ul>
                    </li>
                    
                    <!-- Sports -->
                    <li>
                        <NuxtLink to="/sports" class="drop-down" :class="{ 'active': $route.path === '/sports' }">Sports</NuxtLink>
                    </li>
                    
                    <!-- Events -->
                    <li>
                        <NuxtLink to="/events" class="drop-down" :class="{ 'active': $route.path === '/events' }">Events</NuxtLink>
                    </li>
                    
                    <!-- News -->
                    <li>
                        <NuxtLink to="/news" class="drop-down" :class="{ 'active': $route.path === '/news' }">News</NuxtLink>
                    </li>
                    
                    <!-- Contact Us -->
                    <li>
                        <NuxtLink to="/contact" class="drop-down" :class="{ 'active': $route.path === '/contact' }">Contact Us</NuxtLink>
                    </li>
                </ul>
            </div>
            
            <!-- Mobile Navigation -->
            <div class="mobile-nav d-lg-none d-block">
                <!-- Mobile Menu Button -->
                <div class="mobile-menu-btn" @click="toggleMobileMenu">
                    <i class="bi bi-list text-dark" :class="{ 'd-none': mobileMenuOpen }"></i>
                    <i class="bi bi-x-lg text-dark" :class="{ 'd-none': !mobileMenuOpen }"></i>
                </div>
                
                <!-- Mobile Menu Overlay -->
                <div class="mobile-menu-overlay" :class="{ 'active': mobileMenuOpen }" @click="closeMobileMenu"></div>
                
                <!-- Mobile Menu Content -->
                <div class="mobile-menu-content" :class="{ 'active': mobileMenuOpen }">
                    <div class="mobile-logo-area d-flex justify-content-between align-items-center mb-4">
                        <div class="mobile-logo-wrap">
                            <NuxtLink to="/" @click="closeMobileMenu"><img alt="image" src="/assets/images/icons/header2-logo.svg"></NuxtLink>
                        </div>
                        <div class="menu-close-btn" @click="closeMobileMenu">
                            <i class="bi bi-x-lg text-dark"></i>
                        </div>
                    </div>
                    
                    <ul class="mobile-menu-list">
                        <!-- Home -->
                        <li>
                            <NuxtLink 
                                to="/" 
                                class="mobile-nav-link" 
                                :class="{ 'active': $route.path === '/' }"
                                @click="closeMobileMenu"
                            >
                                Home
                            </NuxtLink>
                        </li>
                        
                        <!-- Flying Locations -->
                        <li>
                            <NuxtLink 
                                to="/flyinglocations" 
                                class="mobile-nav-link" 
                                :class="{ 'active': $route.path === '/flyinglocations' }"
                                @click="closeMobileMenu"
                            >
                                Flying Locations
                            </NuxtLink>
                        </li>
                        
                        <!-- About LASF - Mobile Accordion -->
                        <li class="mobile-menu-item-has-children">
                            <div 
                                class="mobile-dropdown-header" 
                                @click="toggleMobileDropdown('about')"
                                :class="{ 'active': $route.path.includes('/about') || $route.path.includes('/gallery') || $route.path.includes('/regulations') }"
                            >
                                <span>About LASF</span>
                                <i class="bi bi-chevron-down" :class="{ 'rotate': activeMobileDropdown === 'about' }"></i>
                            </div>
                            <ul class="mobile-sub-menu" :class="{ 'active': activeMobileDropdown === 'about' }">
                                <li>
                                    <NuxtLink 
                                        to="/about" 
                                        class="mobile-sub-link" 
                                        :class="{ 'active': $route.path === '/about' }"
                                        @click="closeMobileMenu"
                                    >
                                        About Us
                                    </NuxtLink>
                                </li>
                                <li>
                                    <NuxtLink 
                                        to="/gallery" 
                                        class="mobile-sub-link" 
                                        :class="{ 'active': $route.path === '/gallery' }"
                                        @click="closeMobileMenu"
                                    >
                                        Gallery
                                    </NuxtLink>
                                </li>
                                       <li>
                                    <NuxtLink 
                                        to="/pilots" 
                                        class="mobile-sub-link" 
                                        :class="{ 'active': $route.path === '/pilots' }"
                                        @click="closeMobileMenu"
                                    >
                                        Pilots
                                    </NuxtLink>
                                </li>
                                <li>
                                    <NuxtLink 
                                        to="/regulations" 
                                        class="mobile-sub-link" 
                                        :class="{ 'active': $route.path === '/regulations' }"
                                        @click="closeMobileMenu"
                                    >
                                        Regulations
                                    </NuxtLink>
                                </li>
                            </ul>
                        </li>
                        
                        <!-- Sports -->
                        <li>
                            <NuxtLink 
                                to="/sports" 
                                class="mobile-nav-link" 
                                :class="{ 'active': $route.path === '/sports' }"
                                @click="closeMobileMenu"
                            >
                                Sports
                            </NuxtLink>
                        </li>
                        
                        <!-- Events -->
                        <li>
                            <NuxtLink 
                                to="/events" 
                                class="mobile-nav-link" 
                                :class="{ 'active': $route.path === '/events' }"
                                @click="closeMobileMenu"
                            >
                                Events
                            </NuxtLink>
                        </li>
                        
                        <!-- News -->
                        <li>
                            <NuxtLink 
                                to="/news" 
                                class="mobile-nav-link" 
                                :class="{ 'active': $route.path === '/news' }"
                                @click="closeMobileMenu"
                            >
                                News
                            </NuxtLink>
                        </li>
                        
                        <!-- Contact Us -->
                        <li>
                            <NuxtLink 
                                to="/contact" 
                                class="mobile-nav-link" 
                                :class="{ 'active': $route.path === '/contact' }"
                                @click="closeMobileMenu"
                            >
                                Contact Us
                            </NuxtLink>
                        </li>
                    </ul>
                    
    
                </div>
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from '#imports'

const route = useRoute()

// Mobile menu state
const mobileMenuOpen = ref(false)
const activeMobileDropdown = ref(null)

// Toggle mobile menu
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  if (!mobileMenuOpen.value) {
    activeMobileDropdown.value = null
  }
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
  activeMobileDropdown.value = null
}

// Toggle mobile dropdown accordion
const toggleMobileDropdown = (dropdown) => {
  if (activeMobileDropdown.value === dropdown) {
    activeMobileDropdown.value = null
  } else {
    activeMobileDropdown.value = dropdown
  }
}

// Handle click outside for desktop dropdowns
onMounted(() => {
  // Initialize desktop dropdown hover behavior
  const dropdownItems = document.querySelectorAll('.menu-item-has-children')
  
  dropdownItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.classList.add('hover')
    })
    
    item.addEventListener('mouseleave', () => {
      item.classList.remove('hover')
    })
  })

  // Close mobile menu on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenuOpen.value) {
      closeMobileMenu()
    }
  })

  // Auto-open mobile dropdown if on About section
  if (route.path.includes('/about') || route.path.includes('/gallery') || route.path.includes('/regulations')) {
    activeMobileDropdown.value = 'about'
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenuOpen.value) {
      closeMobileMenu()
    }
  })
})
</script>

<style scoped>
/* Base Styles */
.header-area {
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
    padding: 1rem 0;
}

.container {
    position: relative;
}

/* Desktop Navigation */
.main-nav {
    flex: 1;
}

.menu-list {
    display: flex;
    gap: 2rem;
    list-style: none;
    margin: 0;
    padding: 0;
    justify-content: center;
}

.menu-list > li {
    position: relative;
}

.menu-list > li > a {
    color: #333;
    text-decoration: none;
    font-weight: 500;
    padding: 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    transition: all 0.3s;
    position: relative;
}

.menu-list > li > a:hover,
.menu-list > li > a.active {
    color: #007bff;
}

.menu-list > li > a.active::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    right: 0;
    height: 2px;
    background: #007bff;
    border-radius: 2px;
}

.dropdown-icon {
    font-size: 0.875rem;
    transition: transform 0.3s;
}

/* Desktop Dropdowns */
.menu-item-has-children .sub-menu {
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    background: white;
    min-width: 220px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    border-radius: 8px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    padding: 0.5rem 0;
    z-index: 100;
}

.menu-item-has-children:hover .sub-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.menu-item-has-children:hover .dropdown-icon {
    transform: rotate(180deg);
}

.sub-menu li {
    list-style: none;
}

.sub-menu a {
    display: block;
    padding: 0.75rem 1.5rem;
    color: #555;
    text-decoration: none;
    transition: all 0.3s;
    white-space: nowrap;
    position: relative;
}

.sub-menu a:hover,
.sub-menu a.active {
    background: #f8f9fa;
    color: #007bff;
    padding-left: 1.75rem;
}

.sub-menu a.active::before {
    content: '';
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    width: 5px;
    height: 5px;
    background: #007bff;
    border-radius: 50%;
}

/* Mobile Navigation */
.mobile-menu-btn {
    cursor: pointer;
    font-size: 1.5rem;
    padding: 0.5rem;
    transition: transform 0.3s;
}

.mobile-menu-btn:hover {
    transform: scale(1.1);
}

.mobile-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s;
    z-index: 999;
}

.mobile-menu-overlay.active {
    opacity: 1;
    visibility: visible;
}

.mobile-menu-content {
    position: fixed;
    top: 0;
    right: -100%;
    width: 100%;
    max-width: 320px;
    height: 100vh;
    background: white;
    padding: 1.5rem;
    overflow-y: auto;
    transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    box-shadow: -2px 0 20px rgba(0,0,0,0.15);
}

.mobile-menu-content.active {
    right: 0;
}

.mobile-logo-area {
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
    margin-bottom: 1.5rem;
}

.menu-close-btn {
    cursor: pointer;
    font-size: 1.5rem;
    padding: 0.5rem;
    transition: transform 0.3s;
}

.menu-close-btn:hover {
    transform: rotate(90deg);
}

/* Mobile Menu List */
.mobile-menu-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.mobile-menu-list > li {
    border-bottom: 1px solid #eee;
}

.mobile-nav-link {
    display: block;
    padding: 1rem 0;
    color: #333;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s;
    position: relative;
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
    color: #007bff;
    background: #f8f9fa;
    padding-left: 1rem;
}

.mobile-nav-link.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #007bff;
}

/* Mobile Dropdown Accordion */
.mobile-menu-item-has-children {
    position: relative;
}

.mobile-dropdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    cursor: pointer;
    color: #333;
    font-weight: 500;
    transition: all 0.3s;
}

.mobile-dropdown-header:hover,
.mobile-dropdown-header.active {
    color: #007bff;
    background: #f8f9fa;
    padding-left: 1rem;
}

.mobile-dropdown-header i {
    transition: transform 0.3s ease;
    font-size: 0.875rem;
}

.mobile-dropdown-header i.rotate {
    transform: rotate(180deg);
}

.mobile-sub-menu {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    background: #f9fafb;
    border-radius: 0 0 8px 8px;
}

.mobile-sub-menu.active {
    max-height: 300px;
}

.mobile-sub-menu li {
    list-style: none;
}

.mobile-sub-link {
    display: block;
    padding: 0.75rem 1rem 0.75rem 2rem;
    color: #666;
    text-decoration: none;
    transition: all 0.3s;
    border-bottom: 1px solid #eee;
    position: relative;
}

.mobile-sub-link:last-child {
    border-bottom: none;
}

.mobile-sub-link:hover,
.mobile-sub-link.active {
    color: #007bff;
    background: #edf2ff;
    padding-left: 2.5rem;
}

.mobile-sub-link.active::before {
    content: '';
    position: absolute;
    left: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    background: #007bff;
    border-radius: 50%;
}

/* Mobile Contact Info */
.mobile-contact-info {
    border-top: 1px solid #eee;
    padding-top: 1.5rem;
    margin-top: 2rem;
}

.phone-call {
    padding: 1rem;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    border-radius: 10px;
    transition: transform 0.3s;
}

.phone-call:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.phone-call .icon {
    color: #007bff;
    background: white;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0,123,255,0.2);
}

.phone-text p {
    font-size: 0.875rem;
}

.phone-text p:first-child {
    font-size: 1rem;
    color: #333;
    margin-bottom: 0.25rem;
}

/* Responsive Adjustments */
@media (max-width: 991px) {
    .menu-list {
        gap: 1rem;
    }
    
    .menu-list > li > a {
        font-size: 0.9rem;
    }
}

@media (max-width: 768px) {
    .main-nav {
        display: none;
    }
    
    .header-area {
        padding: 0.75rem 0;
    }
    
    .mobile-menu-content {
        width: 85%;
    }
}

@media (min-width: 769px) {
    .mobile-nav {
        display: none;
    }
}

/* Tablet View - Show both for testing */
@media (min-width: 577px) and (max-width: 768px) {
    .mobile-menu-content {
        max-width: 280px;
    }
}

/* Small Mobile */
@media (max-width: 576px) {
    .mobile-menu-content {
        width: 100%;
        max-width: none;
        padding: 1rem;
    }
    
    .mobile-nav-link,
    .mobile-dropdown-header {
        padding: 0.875rem 0;
        font-size: 0.95rem;
    }
    
    .mobile-sub-link {
        padding: 0.625rem 1rem 0.625rem 2rem;
        font-size: 0.9rem;
    }
}

/* Animation for dropdown */
@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.mobile-menu-content.active .mobile-nav-link,
.mobile-menu-content.active .mobile-dropdown-header {
    animation: slideInRight 0.3s ease forwards;
    opacity: 0;
}

.mobile-menu-content.active .mobile-nav-link:nth-child(1) { animation-delay: 0.1s; }
.mobile-menu-content.active .mobile-nav-link:nth-child(2) { animation-delay: 0.15s; }
.mobile-menu-content.active .mobile-dropdown-header:nth-child(3) { animation-delay: 0.2s; }
.mobile-menu-content.active .mobile-nav-link:nth-child(4) { animation-delay: 0.25s; }
.mobile-menu-content.active .mobile-nav-link:nth-child(5) { animation-delay: 0.3s; }
.mobile-menu-content.active .mobile-nav-link:nth-child(6) { animation-delay: 0.35s; }
.mobile-menu-content.active .mobile-nav-link:nth-child(7) { animation-delay: 0.4s; }
</style>