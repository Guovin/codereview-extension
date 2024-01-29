// uno.config.ts
import {
  defineConfig,
  presetUno,
  presetIcons,
  presetMini,
  transformerVariantGroup,
  transformerDirectives
} from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetIcons(), presetMini()],
  rules: [['dark', { color: '#ffffff', 'background-color': '#0d1117' }]],
  transformers: [transformerDirectives(), transformerVariantGroup()]
})
