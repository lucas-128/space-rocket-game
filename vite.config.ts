import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        host: true
    },
    base: './',
    build: {
        minify: true,
        sourcemap: false,
    }
});