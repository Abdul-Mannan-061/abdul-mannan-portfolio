import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {BASE_PATH} from './app/site';

export default defineConfig({
  base: BASE_PATH,
  plugins: [react()],
  build: {target: 'es2022'},
});
