/// <reference types="node" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { studioServer } from './plugins/studio-server'

export default defineConfig({
  plugins: [react(), tailwindcss(), studioServer()],
  server: {
    host: true,
    port: Number(process.env.PORT) || 5199,
    /*
     * O estúdio grava dentro de public/. Sem isto o Vite recarregaria a página
     * a cada arquivo enviado — inclusive a página do próprio estúdio.
     */
    watch: { ignored: ["**/public/presentation/**"] },
  },
})
