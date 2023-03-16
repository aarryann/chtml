import { resolve } from 'path';
import {defineConfig} from "vite";
import {ViteEjsPlugin} from "vite-plugin-ejs";
import {ViteHctPlugin} from "./lib/vite-hct-plugin.js";

const root = resolve(__dirname, 'src');
const outDir = resolve(__dirname, 'public');

export default defineConfig({
  root,
  plugins: [ ViteEjsPlugin(), ViteHctPlugin() ],
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        feeds: resolve(root, 'feeds', 'index.html'),

      }
    }
  }
});
