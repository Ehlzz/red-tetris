import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Pages from 'vite-plugin-pages';

export default defineConfig({
  plugins: [react(), Pages()],
  server: {
    historyApiFallback: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '*.config.js',
        'src/main.jsx',
        'src/pages/SinglePlayer/**',
        'src/pages/MultiPlayer/**',
        'src/pages/MultiPlayerGame/**',
        'src/pages/LobbyGamePage/**',
        '**/*.css'
      ],
      thresholds: {
        statements: 70,
        functions: 70,
        lines: 70,
        branches: 60
      }
    }
  }
})