import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { resolve } from 'path'
import { CRX_CONTENT_OUTDIR } from './globalConfig'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: CRX_CONTENT_OUTDIR,
    lib: {
      entry: [resolve(__dirname, 'src/content-script/index.ts')],
      formats: ['cjs'],
      fileName: () => {
        return 'src/content-script/index.js'
      }
    }
  },
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  plugins: [vue(), UnoCSS()]
})
