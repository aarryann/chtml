import {Plugin, ResolvedConfig, UserConfig} from "vite";
const hct = require('./hct');

// ShortHand for EjsOptions or Undefined

/**
 * Vite Hct Plugin Function
 * See https://github.com/trapcodeio/vite-plugin-hct for more information
 * @example
 * export default defineConfig({
 *  plugins: [
 *  vue(),
 *  ViteHctPlugin()
 *  ],
 * });
 */
function ViteHctPlugin(data: Object = {}, options?: any): Plugin {
  let config: ResolvedConfig;

  return {
    name: "vite-plugin-hct",

    // Get Resolved config
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    transformIndexHtml: {
      enforce: "pre",
      transform(html) {
        html = hct.render(html);

        return html;
      }
    }
  };
}

export {ViteHctPlugin, hct}
