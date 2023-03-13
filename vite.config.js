import {defineConfig} from "vite";
import {ViteHctPlugin} from "./lib/vite-hct-plugin.js";

export default defineConfig({
  plugins: [
    // Without Data
    ViteHctPlugin(),
    
  ],
});
