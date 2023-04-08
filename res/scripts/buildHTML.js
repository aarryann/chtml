require('dotenv').config();
const fse = require('fs-extra');
const path = require('path');
const ejs = require('ejs');
const marked = require('marked');
const frontMatter = require('front-matter');
const glob = require('glob');
const log = require('./logger');
const siteoptions = require('../conf/site.config');
const { encrypt, decrypt } = require('./crypto');
const secretKey = process.env.SECRET1;
let buildMode = process.env.BUILDMODE;
const gen = process.env.BUILDFILE;
/**
 * Build the site
 */
const build = (options = siteoptions || {}) => {
  log.info('Building gen...');
  const startTime = process.hrtime();

  const { build: {srcPath, outPath, regen, cleanUrls, includefiles, excludefiles}, site 
    , template: {delimiter} } 
    = {
      build: Object.assign({}, siteoptions.build, options.build),
      site: Object.assign({}, siteoptions.site, options.site),
      template: Object.assign({}, siteoptions.template, options.template)
    };
  
  // clear destination folder when REGEN
  if (regen) {
    fse.emptyDirSync(outPath);

    if (fse.existsSync(`${srcPath}/assets`)) {
      fse.mkdirsSync(`${outPath}/assets`);
      fse.copySync(`${srcPath}/assets`, `${outPath}/assets`);
    }
    log.info(`Copied ${srcPath}/assets to ${outPath}/assets`);
  } else {
    _copyFolderRecursive(`${srcPath}/assets`, `${outPath}/assets`);
  }

  // read all pages
  const files = glob.sync('**/*.@(md|ejs|html)', {
    cwd: `${srcPath}/pages`,
    ignore: ['**/layouts/**', '**/components/**', '**/js/**']
  });

  files.forEach(
    file =>
      _buildPage(file, { srcPath, outPath, cleanUrls, site, delimiter })
  );

  // display build time
  const timeDiff = process.hrtime(startTime);
  const duration = timeDiff[0] * 1000 + timeDiff[1] / 1e6;
  log.success(`Site built succesfully in ${duration}ms`);
};

/**
 * Loads a layout file
 */
const _loadLayout = (layout, pluginDir, { srcPath }) => {
  let file = (pluginDir && `${srcPath}/pages/${pluginDir}/layouts/${layout}.ejs`) || `${srcPath}/layouts/${layout}.ejs`;
  let data;
  try {
    data = fse.readFileSync(file, 'utf-8');
  } catch {
    file = `${srcPath}/layouts/${layout}.ejs`;
    data = fse.readFileSync(file, 'utf-8');
  }

  return { file, data };
};

function _copyFolderRecursive(sourceDir, destDir) {
  // Ensure that the destination folder exists
  fse.mkdirSync(destDir, { recursive: true });

  const files = fse.readdirSync(sourceDir);
  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);

    if (fse.statSync(sourcePath).isDirectory()) {
      _copyFolderRecursive(sourcePath, destPath);
    } else {
      const sourceMtimeMs = fse.statSync(sourcePath).mtimeMs;
      const destExists = fse.existsSync(destPath);
      const destMtimeMs = destExists ? fse.statSync(destPath).mtimeMs : 0;

      if (!destExists || sourceMtimeMs > destMtimeMs) {
        fse.copyFileSync(sourcePath, destPath);
        log.info(`Copied ${sourcePath} to ${destPath}`);
      }
    }
  }
}

/**
 * Build a single page
 */
const _buildPage = (file, { srcPath, outPath, cleanUrls, site, delimiter, regen }) => {
  const fileData = path.parse(file);
  // render complete page as well as page fragment for full loading vs partial (htmx) loading
  const pluginDir = fileData.dir.split('/')[0];
  const sourceFilePath = `${srcPath}/pages/${file}`;

  let destPath = path.join(outPath, fileData.dir);
  let fragmentPath = path.join(outPath, 'views', fileData.dir);
  // create extra dir if generating clean URLs and filename is not index
  if (cleanUrls && fileData.name !== 'index') {
    destPath = path.join(destPath, fileData.name);
    fragmentPath = path.join(fragmentPath, fileData.name);
  }

  let destFilePath = `${destPath}.html`;
  if (cleanUrls) {
    destFilePath = `${destPath}/index.html`;
  }

  const templateMtimeMs = fse.statSync(sourceFilePath).mtimeMs;
  const outputExists = fse.existsSync(destFilePath);
  const outputMtimeMs = outputExists ? fse.statSync(destFilePath).mtimeMs : 0;

  if (!regen && templateMtimeMs <= outputMtimeMs) {
    log.info(`skipping gen - ${file}...`);
    return;
  }

  // create destination directory
  fse.mkdirsSync(destPath);
  fse.mkdirsSync(fragmentPath);

  // read page file
  const data = fse.readFileSync(`${srcPath}/pages/${file}`, 'utf-8');

  // render page
  const pageData = frontMatter(data);
  const templateConfig = {
    site,
    page: pageData.attributes,
    delimiter
  };

  let pageContent;
  const pageSlug = file.split(path.sep).join('-');

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
      slot: pageContent,
      filename: `${srcPath}/layout-${layoutName}`
    })
  );

  const fragmentPage = ejs.render(
    fragmentLayout.data,
    Object.assign({}, templateConfig, {
      slot: pageContent,
      filename: `${srcPath}/layout-fragment`
    })
  );

  // save the html file with both full layout and without layout (fragments)
  // The fragment files will be used for HTMX ajax pull of files in navigation
  log.info(`building gen - ${file}...`);
  if (cleanUrls) {
    fse.writeFileSync(`${destPath}/index.html`, completePage);
    fse.writeFileSync(`${fragmentPath}/index.html`, fragmentPage);
  } else {
    fse.writeFileSync(`${destPath}/${fileData.name}.html`, completePage);
    fse.writeFileSync(`${fragmentPath}/${fileData.name}.html`, fragmentPage);
  }
};

module.exports = build;
