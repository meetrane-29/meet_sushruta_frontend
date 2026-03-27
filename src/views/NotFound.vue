<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p class="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</p>
      <p class="text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>

      <div class="space-x-4">
        <router-link
          to="/"
          class="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Back to Home
        </router-link>
        <button
          @click="$router.back()"
          class="inline-block px-8 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
