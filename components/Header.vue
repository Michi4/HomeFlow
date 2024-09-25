<template>
  <header class="bg-primary text-white shadow-md">
    <nav class="container mx-auto px-6 py-3">
      <div class="flex justify-between items-center">
        <NuxtLink to="/" class="text-2xl font-bold">My App</NuxtLink>
        <div class="flex space-x-4">
          <NuxtLink v-if="!session" to="/login" class="hover:text-gray-200">Login</NuxtLink>
          <NuxtLink v-if="!session" to="/signup" class="hover:text-gray-200">Sign Up</NuxtLink>
          <button v-if="session" @click="logout" class="hover:text-gray-200">Logout</button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth'

const { session, logout } = useAuth()
</script>