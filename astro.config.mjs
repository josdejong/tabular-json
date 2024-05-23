import { defineConfig } from 'astro/config'
import svelte from '@astrojs/svelte'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { rehypeHeadingIds } from '@astrojs/markdown-remark'

// https://astro.build/config
export default defineConfig({
  markdown: {
    rehypePlugins: [rehypeHeadingIds, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
    shikiConfig: {
      // syntax highlighting
      // https://github.com/shikijs/shiki/blob/main/docs/themes.md
      theme: 'github-light'
    }
  },
  integrations: [svelte()]
})
