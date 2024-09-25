<template>
    <div>
      <slot v-bind="{ loggedIn, user, session, fetch, clear }" />
      <slot name="placeholder" v-if="!ready" />
    </div>
  </template>
  
  <script setup>
  const { ready, loggedIn, user, session, fetch, clear } = useUserSession();
  </script>
