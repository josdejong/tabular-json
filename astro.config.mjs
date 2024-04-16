import { defineConfig } from 'astro/config'
import svelte from '@astrojs/svelte'

// https://astro.build/config
export default defineConfig({
  markdown: {
    shikiConfig: {
      // syntax highlighting
      // https://github.com/shikijs/shiki/blob/main/docs/themes.md
      theme: 'github-light'
    }
  },
  integrations: [svelte()]
})
