// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: '/assets/logo-green.png' },
        // Fonts of the public pages (see --public-font-* in theme.css)
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Sans:wght@500;700&display=swap',
        },
      ],
    },
  },
  devtools: { enabled: true },
  devServer: { port: 4567 },

  css: ['~/assets/css/theme.css', '~/assets/css/admin.css', '~/assets/css/public.css', '~/assets/css/event-themes.css'],

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
