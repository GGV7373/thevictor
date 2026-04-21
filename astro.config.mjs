// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare({
    prerenderEnvironment: 'node',
    // @ts-ignore - platformProxy is a valid option for cloudflare adapter
    platformProxy: {
      enabled: true
    },
    imageService: "cloudflare"
  })
});