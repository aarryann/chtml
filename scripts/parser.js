const buildDefaults = {
    srcPath: './src',
    outputPath: './public',
    cleanUrls: true
  };
  
  /**
   * Parse options, setting the defaults on missing values
   */
  const parseOptions = options => {
    const { srcPath, outputPath, cleanUrls, site, template } = Object.assign(
      {},
      buildDefaults,
      options.build,
      {site: options.site || {}},
      {template: options.template || {}}
    );

    return { srcPath, outputPath, cleanUrls, site, template };
  };
  
  module.exports = {
    parseOptions
  };