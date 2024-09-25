<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-center text-primary">Sign Up</h2>
        <form @submit.prevent="handleSignup" class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
            <input type="text" id="username" v-model="username" required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="email" v-model="email" required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" id="password" v-model="password" required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
          </div>
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input type="password" id="confirmPassword" v-model="confirmPassword" required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
          </div>
          <button type="submit" class="w-full bg-primary hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105">
            Sign Up
          </button>
        </form>
        
        <OauthButtons />
        
        <p class="mt-4 text-center text-sm text-gray-600">
          Already have an account? 
          <NuxtLink to="/login" class="font-medium text-primary hover:text-green-600">
            Login
          </NuxtLink>
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const username = ref('')
  const email = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  
  const handleSignup = () => {
    // Implement signup logic here
    console.log('Signup attempt:', username.value, email.value, password.value)
  }
  </script>