// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'lasf',
      htmlAttrs: {
        lang: 'en',
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },

      ],
      script: [
        // Load jQuery first (with defer to avoid blocking)
        { 
          src: '/assets/js/jquery-3.6.0.min.js', 
          tagPosition: 'head',
          defer: true 
        },
        
        // Then jQuery UI
        { 
          src: '/assets/js/jquery-ui.js', 
          tagPosition: 'head',
          defer: true 
        },
        // Then Bootstrap
        { 
          src: '/assets/js/bootstrap.bundle.min.js', 
          tagPosition: 'bodyClose',
          defer: true 
        },
        // Then Swiper
        { 
          src: '/assets/js/swiper-bundle.min.js', 
          tagPosition: 'bodyClose',
          defer: true 
        },
        // Then other jQuery plugins
        { 
          src: '/assets/js/jquery.nice-select.js', 
          tagPosition: 'bodyClose',
          defer: true 
        },
        { 
          src: '/assets/js/odometer.min.js', 
          tagPosition: 'bodyClose',
          defer: true 
        },
        { 
          src: '/assets/js/viewport.jquery.js', 
          tagPosition: 'bodyClose',
          defer: true 
        },
        { 
          src: '/assets/js/jquery.magnific-popup.min.js', 
          tagPosition: 'bodyClose',
          defer: true 
        },
        { 
          src: '/assets/js/isotope.pkgd.min.js', 
          tagPosition: 'bodyClose',
          defer: true 
        },
        // Leaflet - load after jQuery
        {
          src: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
          integrity: 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=',
          crossorigin: '',
          tagPosition: 'bodyClose',
          defer: true
        },
        // Your main.js last
        { 
          src: '/assets/js/main.js', 
          tagPosition: 'bodyClose',
          defer: true 
        },
        // Remove the Cloudflare script unless you need it
        // { src: '/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js', tagPosition: 'bodyClose' },
      ],
    },
  },
  
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || '',
      mediaBase: process.env.MEDIA_BASE_URL || ''
    }
  },

  // Add build configuration
  build: {
    transpile: [],
  },

  // Add modules for better compatibility
  modules: [],

  // Add plugins configuration
  plugins: [],

  // Add CSS configuration
  css: [
    '@/assets/css/animate.css',
    '@/assets/css/all.css',
    '@/assets/css/bootstrap.min.css',
    '@/assets/css/boxicons.min.css',
    '@/assets/css/bootstrap-icons.css',
    '@/assets/css/jquery-ui.css',
    '@/assets/css/swiper-bundle.css',
    '@/assets/css/nice-select.css',
    '@/assets/css/select2.min.css',
    '@/assets/css/magnific-popup.css',
    '@/assets/css/odometer.css',
    '@/assets/css/style.css',
  ]
})