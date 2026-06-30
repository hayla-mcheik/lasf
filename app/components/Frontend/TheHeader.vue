<!-- components/Frontend/TheHeader.vue -->
<template>
    <header class="header-area style-2">
        <div class="container-fluid d-flex justify-content-between align-items-center">
            <div class="header-logo">
                <NuxtLink to="/"><img alt="image" class="img-fluid" src="/assets/images/icons/logo.png"></NuxtLink>
            </div>
            
            <!-- Desktop Navigation -->
            <div class="main-nav d-lg-block d-none">
                <ul class="menu-list">
                    <li>
                        <NuxtLink to="/" class="drop-down" :class="{ 'active': $route.path === '/' }">Home</NuxtLink>
                    </li>
                    
                    <li class="menu-item-has-children">
                        <NuxtLink to="#" class="drop-down" :class="{ 'active': $route.path.includes('/about') || $route.path.includes('/gallery') || $route.path.includes('/regulations') }">
                             Flight Operations <i class="bi bi-chevron-down dropdown-icon"></i>
                        </NuxtLink>
                        <ul class="sub-menu">
                            <li><NuxtLink to="/clearance-news" :class="{ 'active': $route.path === '/clearance-news' }">Flight Clearance News</NuxtLink></li>
                            <li><NuxtLink to="/location" :class="{ 'active': $route.path === '/location' }">Flying Locations Status</NuxtLink></li>
                        </ul>
                    </li>
                    <!-- About LASF Dropdown -->
                    <li class="menu-item-has-children">
                        <NuxtLink to="#" class="drop-down" :class="{ 'active': $route.path.includes('/about') || $route.path.includes('/gallery') || $route.path.includes('/regulations') }">
                            About Us <i class="bi bi-chevron-down dropdown-icon"></i>
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
                    
                    <!-- Contact Us -->
                    <li>
                        <NuxtLink to="/contact" class="drop-down" :class="{ 'active': $route.path === '/contact' }">Contact us</NuxtLink>
                    </li>
                </ul>
            </div>
            
            <!-- Auth Buttons - Desktop -->
            <div class="auth-buttons d-lg-flex d-none">
  <template v-if="!authStore.isAuthenticated">

    <NuxtLink to="/login" >
      Login
    </NuxtLink>

    <NuxtLink to="/register">
      Register
    </NuxtLink>

  </template>

<template v-else>

  <NuxtLink
    v-if="authStore.user?.is_admin || authStore.user?.role === 'army'"
    to="/admin/dashboard"
  >
    Dashboard
  </NuxtLink>

  <NuxtLink
    v-else
    to="/account"
  >
    My Account
  </NuxtLink>

  <a href="#" @click.prevent="authStore.logout()">
    Logout
  </a>

</template>
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
                            <NuxtLink to="/" @click="closeMobileMenu"><img alt="image" src="/assets/images/icons/logo.png" class="img-fluid"></NuxtLink>
                        </div>
                        <div class="menu-close-btn" @click="closeMobileMenu">
                            <i class="bi bi-x-lg text-dark"></i>
                        </div>
                    </div>
                    
                    <!-- Mobile Auth Buttons -->
                    <div class="mobile-auth-buttons mb-4">
  <template v-if="!authStore.isAuthenticated">

    <NuxtLink to="/login" @click="closeMobileMenu">
      Login
    </NuxtLink>

    <NuxtLink to="/register" @click="closeMobileMenu">
      Register
    </NuxtLink>

  </template>

<template v-else>

  <NuxtLink
    v-if="authStore.user?.is_admin || authStore.user?.role === 'army'"
    to="/admin/dashboard" @click="closeMobileMenu"
  >
    Dashboard
  </NuxtLink>

  <NuxtLink
    v-else
    to="/account" @click="closeMobileMenu"
  >
    My Account
  </NuxtLink>

 <a
    href="#"
    @click.prevent="
        closeMobileMenu();
        authStore.logout();
    "
>
    Logout
  </a>

</template>
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
                        
                        <li class="mobile-menu-item-has-children">
                            <div 
                                class="mobile-dropdown-header" 
                                @click="toggleMobileDropdown('clearance-news')"
                                :class="{ 'active': $route.path.includes('/clearance-news') || $route.path.includes('/location') }"
                            >
                                <span>Flight Operations</span>
                                <i class="bi bi-chevron-down" :class="{ 'rotate': activeMobileDropdown === 'clearance-news' }"></i>
                            </div>
                            <ul class="mobile-sub-menu" :class="{ 'active': activeMobileDropdown === 'clearance-news' }">
                                <li>
                                    <NuxtLink 
                                        to="/clearance-news" 
                                        class="mobile-sub-link" 
                                        :class="{ 'active': $route.path === '/clearance-news' }"
                                        @click="closeMobileMenu"
                                    >
                                         Flight Clearance News
                                    </NuxtLink>
                                </li>
                                <li>
                                    <NuxtLink 
                                        to="/location" 
                                        class="mobile-sub-link" 
                                        :class="{ 'active': $route.path === '/location' }"
                                        @click="closeMobileMenu"
                                    >
                                       Flying Locations Status
                                    </NuxtLink>
                                </li>
                            </ul>
                        </li>
                        
                        <!-- About LASF - Mobile Accordion -->
                        <li class="mobile-menu-item-has-children">
                            <div 
                                class="mobile-dropdown-header" 
                                @click="toggleMobileDropdown('about')"
                                :class="{ 'active': $route.path.includes('/about') || $route.path.includes('/gallery') || $route.path.includes('/regulations') }"
                            >
                                <span>About Us</span>
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
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
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
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    color: darkgreen;
}

.menu-list > li > a.active::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    right: 0;
    height: 2px;
    background: darkgreen;
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
    color: darkgreen;
    padding-left: 1.75rem;
}

/* Desktop Auth Buttons */
.auth-buttons {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-left: 2rem;
}

.btn-login,
.btn-register {
    padding: 0.5rem 1.5rem;
    border-radius: 25px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s;
    display: inline-block;
    font-size: 12px;
}

.btn-login {
    color: darkgreen;
    border: 2px solid darkgreen;
    background: transparent;
}

.btn-login:hover {
    background: darkgreen;
    color: white;
    transform: translateY(-2px);
}

.btn-register {
    color: white;
    background: darkgreen;
    border: 2px solid darkgreen;
}

.btn-register:hover {
    background: #006400;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,100,0,0.2);
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

.mobile-menu-overlay{
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.45);
    z-index:99998;
    opacity:0;
    visibility:hidden;
    transition:.3s;
}

.mobile-menu-overlay.active{
    opacity:1;
    visibility:visible;
}

.mobile-menu-content{
    position:fixed;
    top:0;
    right:-100%;
    width:320px;
    max-width:90%;
    height:100vh;
    background:#fff;
    overflow-y:auto;
    overflow-x:hidden;
    padding:20px;
    transition:right .35s ease;
    z-index:99999;
    pointer-events:auto;
}
.mobile-menu-content.active{
    right:0;
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

/* Mobile Auth Buttons */
.mobile-auth-buttons{
    display:flex;
    flex-direction:column;
    gap:12px;
    margin-bottom:20px;
    padding-bottom:20px;
    border-bottom:1px solid #eee;
}
.mobile-auth-buttons a{
    display:flex;
    justify-content:center;
    align-items:center;

    width:100%;
    min-height:48px;

    text-decoration:none;
    border-radius:8px;

    cursor:pointer;

    position:relative;
    z-index:10;

    pointer-events:auto;
}
.mobile-auth-buttons a:first-child{
    border:2px solid darkgreen;
    color:darkgreen;
    background:#fff;
}

.mobile-auth-buttons a:last-child{
    background:darkgreen;
    color:#fff;
}

.mobile-btn-login,
.mobile-btn-register {
    flex: 1;
    text-align: center;
    padding: 0.75rem;
    border-radius: 25px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s;
    font-size: 12px;
}

.mobile-btn-login {
    color: darkgreen;
    border: 2px solid darkgreen;
    background: transparent;
}

.mobile-btn-register {
    color: white;
    background: darkgreen;
    border: 2px solid darkgreen;
}

.mobile-btn-login:active,
.mobile-btn-register:active {
    transform: scale(0.98);
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

.mobile-logo-wrap {
    width: 60%;
}

.mobile-nav-link {
    display:flex;
    align-items:center;
    width:100%;
    min-height:48px;
    cursor:pointer;
    padding: 1rem 0;
    color: #333;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s;
    position: relative;
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
    color: darkgreen;
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
    background: darkgreen;
}

/* Mobile Dropdown Accordion */
.mobile-menu-item-has-children {
    position: relative;
}

.mobile-dropdown-header {
       display:flex;
    align-items:center;
    justify-content:space-between;
    width:100%;
    min-height:48px;
    cursor:pointer;
    position:relative;
    z-index:5;
    padding: 1rem 0;
    color: #333;
    font-weight: 500;
    transition: all 0.3s;
}
.mobile-menu-content *,
.mobile-menu-content a,
.mobile-menu-content button{
    pointer-events:auto;
}

.mobile-menu-content{
    touch-action:manipulation;
}

.mobile-dropdown-header:hover,
.mobile-dropdown-header.active {
    color: darkgreen;
    background: #f8f9fa;
    padding-left: 1rem;
}

.mobile-dropdown-header i {
    transition: transform 0.3s ease;
    font-size: 1.2rem;
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
     display:flex;
    align-items:center;
    width:100%;
    min-height:48px;
    color:#000;
    text-decoration:none;
    cursor:pointer;
    position:relative;
    z-index:20;
    padding: 1rem 1.2rem 1rem 2.2rem;
    color: #000;
    transition: all 0.3s;
    border-bottom: 1px solid #eee;
}

.mobile-sub-link:last-child {
    border-bottom: none;
}

.mobile-sub-link:hover,
.mobile-sub-link.active {
    color: darkgreen;
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
    background: darkgreen;
    border-radius: 50%;
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
    
    .auth-buttons {
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

/* Tablet View */
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
        padding: 1rem 0;
    }
    
    .mobile-sub-link {
        padding: 0.875rem 1rem 0.875rem 2rem;
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
header.style-2 .main-nav ul li a{
    font-size: 14px !important;
}
</style>