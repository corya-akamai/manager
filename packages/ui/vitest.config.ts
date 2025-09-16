import { visualizer } from 'rollup-plugin-visualizer';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [svgr({ exportAsDefault: true }), visualizer({ open: true })],
  test: {
    environment: 'jsdom',
    setupFiles: './testSetup.ts',
  },
});
