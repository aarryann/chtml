const path = require('path')

module.exports = function (source) {
  const filename = path.basename(this.resourcePath)
  console.log(this.rootContext);
  const newFilename = this.resourcePath.replace(this.rootContext, '').replace('/src/pages', 'views');
  this.emitFile(newFilename, source);

  return source;
}

/**
 * Build a single page
 */
const _buildPage = (source, resourcePath, { srcPath, outputPath, cleanUrls, site, template }) => {

  // render page
  const pageData = frontMatter(source);
  const templateConfig = {
    site,
    page: pageData.attributes,
    delimiter: template.delimiter
  };

  let pageContent;
  const pageSlug = resourcePath.split(path.sep).join('-');

  // generate page content according to file type
  switch (fileData.ext) {
    case '.md':
      pageContent = marked(pageData.body);
      break;
      case '.html':
      case '.ejs':
      pageContent = ejs.render(pageData.body, Object.assign({}, templateConfig, {
        filename: `${srcPath}/page-${pageSlug}`
      }));
      break;
    default:
      pageContent = pageData.body;
  }

  // render layout with page contents
  const layoutName = pageData.attributes.layout || 'default';
  const layout = _loadLayout(layoutName, pluginDir, {
    srcPath
  });

  const fragmentLayout = _loadLayout('fragment', null, {
    srcPath
  });

  const completePage = ejs.render(
    layout.data,
    Object.assign({}, templateConfig, {
      body: pageContent,
      filename: `${srcPath}/layout-${layoutName}`
    })
  );

  const fragmentPage = ejs.render(
    fragmentLayout.data,
    Object.assign({}, templateConfig, {
      body: pageContent,
      filename: `${srcPath}/layout-fragment`
    })
  );

  // save the html file with both full layout and without layout (fragments)
  // The fragment files will be used for HTMX ajax pull of files in navigation
  if (cleanUrls) {
    fse.writeFileSync(`${destPath}/index.html`, completePage);
    fse.writeFileSync(`${fragmentPath}/index.html`, fragmentPage);
  } else {
    fse.writeFileSync(`${destPath}/${fileData.name}.html`, completePage);
    fse.writeFileSync(`${fragmentPath}/${fileData.name}.html`, fragmentPage);
  }
};