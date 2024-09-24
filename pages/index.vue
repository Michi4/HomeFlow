<template>
    <div class="container mx-auto py-8">
      <h1 class="text-4xl font-bold mb-4">Welcome to My Nuxt App</h1>
      <p class="text-lg mb-8">
        This is a simple Nuxt.js application with Tailwind CSS and the nuxt-auth-utils module.
      </p>
      <AuthState v-slot="{ loggedIn, user }">
        <div v-if="loggedIn" class="bg-gray-100 p-6 rounded-lg">
          <h2 class="text-2xl font-bold mb-4">Hello, {{ user.login }}!</h2>
          <p>You are currently logged in.</p>
        </div>
        <div v-else class="bg-gray-100 p-6 rounded-lg">
          <h2 class="text-2xl font-bold mb-4">Not Logged In</h2>
          <p>
            Please
            <a href="/login" class="text-blue-500 hover:text-blue-600">login</a>
            to access more features.
          </p>
        </div>
      </AuthState>
    </div>
  </template>