<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-3xl font-bold mb-6 text-center text-primary">Welcome to Our App</h1>
      <div class="space-y-4">
        <NuxtLink to="/login" class="block w-full text-center bg-primary hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105">
          Login
        </NuxtLink>
        <NuxtLink to="/signup" class="block w-full text-center border border-primary text-primary hover:bg-primary hover:text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105">
          Sign Up
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
// You can add any necessary setup logic here
</script>