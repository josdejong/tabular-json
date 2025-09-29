import { vitePreprocess } from '@astrojs/svelte'

export default {
  preprocess: vitePreprocess(),

  vitePlugin: {
    experimental: {
      async: true
    }
  }
}
