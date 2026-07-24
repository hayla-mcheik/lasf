export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: true,
debug:true,
  nitro: {
    prerender: {
      crawlLinks: false
    }
  },

  devtools: { enabled: true },

  app: {
    baseURL: '/',
    // buildAssetsDir: '/lasf/_nuxt/',
    head: {
      title: 'lasf',
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },

        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap' },
      ],
  script: [
  
      ]
    },
  },

  runtimeConfig: {
    public: {
      // apiBase: process.env.API_BASE_URL || 'https://lasf.info/api',
      // mediaBase: process.env.MEDIA_BASE_URL || 'https://lasf.info/api'   
     apiBase: process.env.API_BASE_URL || 'http://127.0.0.1:8000/api',
     mediaBase: process.env.MEDIA_BASE_URL || 'http://127.0.0.1:8000/api'
    }
  },

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
  ],

  modules: [
   '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    'nuxt-auth-utils', // Move this to the bottom of the list
  ],

  // Pinia configuration
  pinia: {
    // The property 'autoImports' was removed. 
    // If you want to specify directories for your stores:
    storesDirs: ['./stores/**'],
  },

  // Nuxt native auto-imports for specific functions
  imports: {
    dirs: ['./stores'],
    // If you explicitly need to ensure defineStore is available everywhere:
    presets: [
      {
        from: 'pinia',
        imports: ['defineStore', 'acceptHMRUpdate', 'storeToRefs']
      }
    ]
  },

  plugins: [
    '~/plugins/jquery.client.ts',
  ]
})