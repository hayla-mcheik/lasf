<!-- components/Frontend/TheFooter.vue -->
<template>
    <footer class="footer-section">
        <div class="footer-top">
         <div class="container-xl container-lg-fluid container">
             <div class="row justify-content-start gy-5">
                 <div class="col-lg-4 col-md-10 col-sm-6 col-11 order-sm-0 order-1">
                     <div class="footer-about d-none d-md-block">
                         <img src="/assets/images/icons/footer-plane.svg" class="footer-plane" alt="image">
                         <div class="footer1-logo">
                             <img src="/assets/images/icons/logo.png" alt="image" class="img-fluid">
                 
                         </div>
                
                     </div>
                         <div class="row footer-meta">
                 <div class="col-lg-12 d-flex justify-content-lg-start justify-content-center align-items-center mb-lg-0 mb-5 d-none d-md-block">
                     <h4>Stay Connected:</h4>
                     <ul class="footer-social">
                         <li><a href="https://www.facebook.com/"><i class='bx bxl-facebook'></i></a></li>
                         <li><a href="https://www.twitter.com/"><i class='bx bxl-twitter'></i></a></li>
                         <li><a href="https://www.instagram.com/"><i class='bx bxl-instagram'></i></a></li> 
                     </ul>
                 </div>
      
             </div>
                 </div>
                 <div class="col-lg-4 col-md-4 col-sm-6 d-flex justify-content-lg-center">
                     <div class="footer-item">
                         <h4>Information</h4>
                         <ul class="link-list">
                             <li><NuxtLink href="/about">About Company</NuxtLink></li>
                             <li><NuxtLink href="/gallery">Gallery</NuxtLink></li>
                             <li><NuxtLink href="/regulations">Regulations</NuxtLink></li>
                             <li><NuxtLink href="/contact">Contact</NuxtLink></li>
                         </ul>
                     </div>
                 </div>
         
                 <div class="col-lg-4 col-md-4 col-sm-6 d-flex justify-content-lg-center">
                     <div class="footer-item">
                         <h4>Reach Us</h4>
                         <ul class="contact-list">
                             <li>
                                 <div class="icon">
                                     <i class="bi bi-telephone"></i>
                                 </div>
                                 <div class="text">
                                     <a href="tel:+961 71 909 008">+961 71 909 008</a> 
                                 </div>
                             </li>
                             <li>
                                 <div class="icon">
                                     <i class="bi bi-envelope"></i>
                                 </div>
                                 <div class="text">
                                     <a href="/cdn-cgi/l/email-protection#543d3a323b14312c35392438317a373b39"><span class="__cf_email__" data-cfemail="c2abaca4ad82a7baa3afb2aea7eca1adaf">contact@lasf.info</span></a>
                                 </div>
                             </li>
                             <li>
                                 <div class="icon">
                                     <i class="bi bi-geo-alt"></i>
                                 </div>
                                 <div class="text">
                        Jounieh, next to telepheric. Chalhoub bldg. Ground floor.
                                 </div>
                             </li>
                         </ul>
                        
                     </div>
                 </div>
             </div>
         
         </div>
        </div>
        <div class="container">
        <div class="footer-bottom">
  <div class="row d-flex align-items-center g-3">
                 <div class="col-lg-12 d-flex justify-content-lg-center justify-content-center text-lg-center text-center px-1">
                     <p>Copyright {{ currentYear }} <a href="#" class="egns-lab">LASF</a> | Design By <a href="https://www.promo-fix.com/" class="egns-lab">Promofix</a></p>
                 </div>
          
             </div>
         </div>
     </div>
     </footer>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from '#imports'

const route = useRoute()

// Current year for copyright
const currentYear = ref(new Date().getFullYear())

// Mobile navigation items for bottom bar
const mobileNavItems = ref([
  { name: 'Home', path: '/', icon: 'fas fa-home' },
  { name: 'Search', path: '/search', icon: 'fas fa-search' },
  { name: 'Cart', path: '/cart', icon: 'fas fa-shopping-cart' },
  { name: 'Profile', path: '/profile', icon: 'fas fa-user' },
  { name: 'Menu', path: '/menu', icon: 'fas fa-bars' }
])

// Desktop navigation items
const desktopNavItems = ref([
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Products', path: '/products' },
  { name: 'Contact', path: '/contact' }
])

const isMobile = ref(false)

const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<style scoped>
/* Base Footer Styles */
.site-footer {
  background: #333;
  color: white;
  margin-top: auto;
}

/* Mobile Footer */
.mobile-footer {
  padding-bottom: 70px; /* Space for bottom nav bar */
}

.footer-content {
  padding: 2rem 1rem;
  text-align: center;
}

.footer-logo {
  margin-bottom: 1rem;
}

.footer-logo .logo-img {
  height: 40px;
  width: auto;
  filter: brightness(0) invert(1);
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.footer-link {
  color: #ccc;
  text-decoration: none;
  font-size: 0.875rem;
}

.footer-link:hover {
  color: white;
}

.copyright {
  color: #999;
  font-size: 0.875rem;
  margin-top: 1rem;
}

/* Mobile Bottom Navigation Bar */
.mobile-nav-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  display: flex;
  justify-content: space-around;
  padding: 0.5rem 0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #666;
  padding: 0.5rem;
  flex: 1;
}

.nav-item i {
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
}

.nav-label {
  font-size: 0.75rem;
}

.nav-item.active {
  color: #007bff;
}

/* Desktop Footer */
.desktop-footer {
  padding: 3rem 0 1.5rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-col {
  margin-bottom: 1.5rem;
}

.footer-title {
  color: white;
  font-size: 1.25rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.footer-description {
  color: #ccc;
  line-height: 1.6;
  margin-top: 1rem;
}

.footer-links-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links-list li {
  margin-bottom: 0.5rem;
}

.footer-links-list .footer-link {
  color: #ccc;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links-list .footer-link:hover {
  color: white;
  padding-left: 5px;
}

.contact-info p {
  color: #ccc;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #444;
  color: white;
  border-radius: 50%;
  text-decoration: none;
  transition: background 0.3s;
}

.social-link:hover {
  background: #007bff;
}

.footer-bottom {
  border-top: 1px solid #444;
  padding-top: 1.5rem;

}

.legal-links {
  display: flex;
  gap: 1.5rem;
}

.legal-link {
  color: #ccc;
  text-decoration: none;
  font-size: 0.875rem;
}

.legal-link:hover {
  color: white;
}

/* Responsive styles */
@media (max-width: 768px) {
  .desktop-footer {
    display: none;
  }
  
  .footer-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .legal-links {
    justify-content: center;
  }
}

@media (min-width: 769px) {
  .mobile-footer {
    display: none;
  }
}
</style>