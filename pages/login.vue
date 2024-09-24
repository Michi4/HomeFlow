<template>
    <div>
      <AuthState v-slot="{ loggedIn, clear }">
        <button v-if="loggedIn" @click="clear">Logout</button>
        <div v-else>
          <a href="/auth/github">Login with GitHub</a>
          <a href="/auth/google">Login with Google</a>
        </div>
      </AuthState>
    </div>
  </template>
  