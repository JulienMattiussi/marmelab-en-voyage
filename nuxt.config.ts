// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/png', href: '/assets/logo-green.png' }],
    },
  },
  devtools: { enabled: true },
  devServer: { port: 4567 },

  css: ['~/assets/css/theme.css', '~/assets/css/admin.css'],

  routeRules: {
    // Listing events costs a Blob "advanced operation" (2,000/month on Hobby):
    // Vercel regenerates the home page at most once an hour, whatever the traffic.
    '/': { isr: 3600 },
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    'nuxt-auth-utils',
  ],
})
