import {Plugin, ResolvedConfig } from "vite";
const hct = require('./hct');

function ViteHctPlugin(): Plugin {
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
        if (config.command === 'serve') {
          // dev: plugin invoked by dev server
          html = hct.render(html);
        }

        return html;
      }
    }
  };
}

export {ViteHctPlugin, hct}
