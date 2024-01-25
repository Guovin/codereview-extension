// uno.config.ts
import {
  defineConfig,
  presetUno,
  presetIcons,
  transformerVariantGroup,
  transformerDirectives
} from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetIcons()],
  transformers: [transformerDirectives(), transformerVariantGroup()]
})
