import { useAuthStore } from "~/stores/auth"

// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore()

  if (to.path === from.path && process.client) return

  // 1. أضف الصفحة الرئيسية "/" إلى القائمة العامة
  const publicPages = ['/', '/login', '/register', '/about']
  
  // تحقق إذا كان المسار الحالي يبدأ بمسار عام أو هو صفحة عامة
  // (استخدمنا startsWith أو مصفوفة للسماح بصفحات مثل تفاصيل المواقع العامة)
  const isPublicPage = publicPages.includes(to.path) || to.path.startsWith('/locations/')

  if (isPublicPage) {
    // إذا كان مسجلاً ويحاول دخول صفحة تسجيل الدخول، وجهه للوحة التحكم
    if (auth.isAuthenticated && to.path === '/login') {
      return navigateTo(auth.isAdmin ? '/admin/dashboard' : '/')
    }
    return // اسمح له بالدخول
  }

  // 2. حماية مسارات الإدارة (Admin)
  if (to.path.startsWith('/admin')) {
    if (!auth.isAuthenticated) {
      return navigateTo('/login')
    }
    if (!auth.isAdmin) {
      return navigateTo('/')
    }
  }

  // 3. حماية المسارات الخاصة بالأعضاء فقط (مثل البروفايل أو الحجز)
  // هنا نقوم بحماية أي شيء ليس عاماً وليس لوحة إدارة
  const memberOnlyPages = ['/dashboard', '/profile', '/check-in']
  if (memberOnlyPages.some(path => to.path.startsWith(path)) && !auth.isAuthenticated) {
    return navigateTo('/login')
  }
})