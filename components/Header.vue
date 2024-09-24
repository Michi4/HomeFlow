<template>
    <header class="bg-gray-800 text-white py-4">
      <div class="container mx-auto flex justify-between items-center">
        <a href="/" class="text-xl font-bold">My Nuxt App</a>
        <div>
          <AuthState v-slot="{ loggedIn, user, clear }">
            <div v-if="loggedIn" class="flex items-center space-x-4">
              <span>Welcome, {{ user.name ? user.name : user.login }}</span>
              <button @click="clear" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                Logout
              </button>
            </div>
            <div v-else class="flex items-center space-x-4">
              <a href="/auth/github" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Login with GitHub
              </a>
              <a href="/auth/google" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                Login with Google
              </a>
            </div>
          </AuthState>
        </div>
      </div>
    </header>
  </template>
  
  <script setup>
  import { useUserSession } from '#auth-utils';
  </script>