export default defineNuxtConfig({
  modules: [
    '@prisma/nuxt',
    'nuxt-auth-utils',
    '@nuxtjs/tailwindcss',
  ],
  runtimeConfig: {
    oauth: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      }
    },
    session: {
      maxAge: 60 * 60 * 24 * 7 // 1 week
    }
  },
  css: ['@/assets/css/main.css'],
  tailwindcss: {
    config: {
      darkMode: 'class', // or 'media'
      theme: {
        extend: {
          colors: {
            primary: process.env.VITE_PRIMARY_COLOR || '#4CAF50',
            darkBackground: process.env.VITE_DARK_MODE_BACKGROUND || '#121212',
            lightBackground: process.env.VITE_LIGHT_MODE_BACKGROUND || '#FFFFFF',
          },
        },
      },
      plugins: [],
    }
  }
});