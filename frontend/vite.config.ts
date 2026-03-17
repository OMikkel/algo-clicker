import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
// import mkcert from 'vite-plugin-mkcert';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        // mkcert(),
        tailwindcss(),
        react(),
        babel({ presets: [reactCompilerPreset()] })
    ],
})
