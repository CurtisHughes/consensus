import { globalIgnores } from 'eslint/config';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import pluginVue from 'eslint-plugin-vue';
import pluginCypress from 'eslint-plugin-cypress';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/coverage/**', 'cypress/screenshots/**', 'cypress/videos/**']),

  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    ...pluginCypress.configs.recommended,
    files: ['cypress/**/*.{js,ts}'],
  },

  skipFormatting,
);
