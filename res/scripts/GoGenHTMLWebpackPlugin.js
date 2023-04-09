const buildHTML = require('./buildHTML');
const pluginName = 'GoGenHTMLWebpackPlugin';

class GoGenHTMLWebpackPlugin {
  apply(compiler) {
    compiler.hooks.run.tap(pluginName, (compilation) => {
      console.log('The webpack build gen process is starting!');
      buildHTML({
        build: {regen: true, srcPath: './src', outPath: './gen', outExtn: 'html'}, 
        template: {delimiter: '?'}
      });
    });
  }
}

module.exports = GoGenHTMLWebpackPlugin;
