<template>
  <div class="container mx-auto py-8">
    <h1 class="text-4xl font-bold mb-4">Login</h1>
    <p class="text-lg mb-8">
      Log in to your account using your GitHub or Google credentials.
    </p>
    <div class="bg-gray-100 p-6 rounded-lg flex flex-col space-y-4">
      <a href="/auth/github" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
        Login with GitHub
      </a>
      <a href="/auth/google" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
        Login with Google
      </a>
    </div>
  </div>
</template>