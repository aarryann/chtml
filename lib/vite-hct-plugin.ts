import {Plugin, ResolvedConfig, UserConfig} from "vite";
const hct = require('./hct');
const path = require('path');

// ShortHand for EjsOptions or Undefined

/**
 * Vite Ejs Plugin Function
 * See https://github.com/trapcodeio/vite-plugin-ejs for more information
 * @example
 * export default defineConfig({
 *  plugins: [
 *  vue(),
 *  ViteEjsPlugin({foo: 'bar'})
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
      transform(html, ctx) {
        if (typeof data === "function") data = data(config);
        let hctOptions = options && options.hct ? options.hct : {};
        if (typeof hctOptions === "function") hctOptions = hctOptions(config);
        const dataPath = path.join(ctx.path, ctx.filename).replace('.html', '-ssr.js');


        html = hct.render(
          html,
          {
            NODE_ENV: config.mode,
            isDev: config.mode === "development",
            ...data
          },
          {
            // setting views enables includes support
            views: [config.root],
            ...hctOptions,
            async: false // Force sync
          }
        );

        return html;
      }
    }
  };
}


export {ViteHctPlugin, hct}