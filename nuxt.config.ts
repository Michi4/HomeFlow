import process from 'node:process'

export default defineNuxtConfig({
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  runtimeConfig: {
    databaseUrl: '',
    public: {
      url: '',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    stripe: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    },
  },
  modules: ['@nuxt/ui', '@formkit/auto-animate/nuxt', '@nuxtjs/plausible'],
  ui: {
    global: true,
    icons: ['solar', 'tabler', 'octicon', 'devicon', 'logos'],
  },

  plausible: {
    domain: process.env.PLAUSIBLE_DOMAIN,
    apiHost: process.env.PLAUSIBLE_API_HOST ?? 'https://plausible.io',
    trackLocalhost: true,
  },
})
