import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  // Public routes
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/doctor/:slug',
    name: 'DoctorProfile',
    component: () => import('@/views/DoctorProfile.vue')
  },
  {
    path: '/book/:doctorId',
    name: 'BookAppointment',
    component: () => import('@/views/BookAppointment.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/admin-registration',
    name: 'AdminRegistration',
    component: () => import('@/views/AdminRegistration.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/doctors',
    name: 'DoctorsDirectory',
    component: () => import('@/views/DoctorsDirectory.vue')
  },
  {
    path: '/hospitals',
    name: 'HospitalsDirectory',
    component: () => import('@/views/HospitalsDirectory.vue')
  },
  {
    path: '/specialties',
    name: 'SpecialtiesDirectory',
    component: () => import('@/views/SpecialtiesDirectory.vue')
  },

  // Dashboard routes - lazy-loaded with auth required
  {
    path: '/dashboard',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'admin',
        name: 'AdminDashboard',
        component: () => import('@/views/dashboard/AdminDashboard.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },
      {
        path: 'appointments',
        name: 'AdminAppointments',
        component: () => import('@/views/dashboard/AdminAppointments.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'patients',
        name: 'PatientsList',
        component: () => import('@/views/dashboard/PatientsList.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },
      {
        path: 'doctors',
        name: 'DoctorsManagement',
        component: () => import('@/views/dashboard/DoctorsManagement.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },
      {
        path: 'nurses',
        name: 'NursesManagement',
        component: () => import('@/views/dashboard/NursesManagement.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },
      {
        path: 'pharmacy-staff',
        name: 'PharmacyStaffManagement',
        component: () => import('@/views/dashboard/PharmacyStaffManagement.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },
      {
        path: 'lab-staff',
        name: 'LabStaffManagement',
        component: () => import('@/views/dashboard/LabStaffManagement.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },
      {
        path: 'patient',
        name: 'PatientDashboard',
        component: () => import('@/views/dashboard/PatientDashboard.vue'),
        meta: { requiresAuth: true, role: 'patient' }
      },
      {
        path: 'doctor',
        name: 'DoctorDashboard',
        component: () => import('@/views/dashboard/DoctorDashboardV2.vue'),
        meta: { requiresAuth: true, role: 'doctor' }
      },
      {
        path: 'doctor/analytics',
        name: 'DoctorAnalytics',
        component: () => import('@/views/dashboard/DoctorAnalyticsDashboard.vue'),
        meta: { requiresAuth: true, role: 'doctor' }
      },
      {
        path: 'doctor/consult/:appointmentId',
        name: 'ConsultationView',
        component: () => import('@/views/dashboard/ConsultationView.vue'),
        meta: { requiresAuth: true, role: 'doctor' }
      },
      {
        path: 'nurse',
        name: 'NurseDashboard',
        component: () => import('@/views/dashboard/NurseDashboard.vue'),
        meta: { requiresAuth: true, role: 'nurse' }
      },
      {
        path: 'pharmacy',
        name: 'PharmacyDashboard',
        component: () => import('@/views/dashboard/PharmacyDashboard.vue'),
        meta: { requiresAuth: true, role: 'pharmacy' }
      },
      {
        path: 'pharmacy/medicines',
        name: 'PharmacyInventory',
        component: () => import('@/components/PharmacyInventory.vue'),
        meta: { requiresAuth: true, role: 'pharmacy' }
      },
      {
        path: 'pharmacy/stock',
        name: 'StockManagement',
        component: () => import('@/components/StockManagement.vue'),
        meta: { requiresAuth: true, role: 'pharmacy' }
      },
      {
        path: 'pharmacy/low-stock',
        name: 'LowStockAlerts',
        component: () => import('@/components/LowStockAlerts.vue'),
        meta: { requiresAuth: true, role: 'pharmacy' }
      },
      {
        path: 'pharmacy/expiring',
        name: 'ExpiringMedicines',
        component: () => import('@/components/ExpiringMedicines.vue'),
        meta: { requiresAuth: true, role: 'pharmacy' }
      },
      {
        path: 'pharmacy/dispensing',
        name: 'MedicineDispensing',
        component: () => import('@/components/MedicineDispensing.vue'),
        meta: { requiresAuth: true, role: 'pharmacy' }
      },
      {
        path: 'pharmacy/reports',
        name: 'PharmacyReports',
        component: () => import('@/components/PharmacyReports.vue'),
        meta: { requiresAuth: true, role: 'pharmacy' }
      },
      {
        path: 'reception',
        name: 'ReceptionDashboard',
        component: () => import('@/views/dashboard/ReceptionDashboard.vue'),
        meta: { requiresAuth: true, role: 'receptionist' }
      },
      {
        path: 'lab',
        name: 'LabDashboard',
        component: () => import('@/views/dashboard/LabDashboard.vue'),
        meta: { requiresAuth: true, role: 'lab' }
      },
      {
        path: 'notifications',
        name: 'NotificationCenter',
        component: () => import('@/views/dashboard/NotificationsCenter.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },

  // Catch-all for 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Read from store OR sessionStorage to handle race conditions on first load
  const token = authStore.accessToken || sessionStorage.getItem('accessToken')
  const role = authStore.role || sessionStorage.getItem('role')

  // If store is empty but sessionStorage has data, restore it now
  if (!authStore.accessToken && token) {
    authStore.initializeFromStorage()
  }

  console.log('[router guard]', to.path, '| role:', role, '| metaRole:', to.meta.role, '| hasToken:', !!token)

  // Redirect to dashboard if already logged in and trying to access login/register
  const authPages = ['/login', '/register']
  if (token && authPages.includes(to.path)) {
    console.log('[router guard] → already logged in, redirecting from', to.path, 'to dashboard')
    const dashboardRoutes = {
      admin:    '/dashboard/admin',
      doctor:   '/dashboard/doctor',
      nurse:    '/dashboard/nurse',
      pharmacy: '/dashboard/pharmacy',
      lab:      '/dashboard/lab',
      patient:  '/dashboard/patient',
    }
    const correctDashboard = dashboardRoutes[role]
    if (correctDashboard) {
      next(correctDashboard)
    } else {
      next('/')
    }
    return
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !token) {
    console.log('[router guard] → blocked (no token), redirecting to /login')
    next('/login')
    return
  }

  // Check role-based access control
  if (to.meta.role && token && role !== to.meta.role) {
    const dashboardRoutes = {
      admin:    '/dashboard/admin',
      doctor:   '/dashboard/doctor',
      nurse:    '/dashboard/nurse',
      pharmacy: '/dashboard/pharmacy',
      lab:      '/dashboard/lab',
      patient:  '/dashboard/patient',
    }
    const correctDashboard = dashboardRoutes[role]
    console.log('[router guard] → wrong role, redirecting to:', correctDashboard || '/login')
    if (correctDashboard) {
      next(correctDashboard)
    } else {
      next('/login')
    }
    return
  }

  next()
})

export default router
