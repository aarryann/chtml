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
  log.info('Building site...');
  const startTime = process.hrtime();

  let lastGenDate,
    genTime = new Date(),
    genCount = 0;
  
  const { srcPath, outputPath, cleanUrls, site, template, includefiles, excludefiles } = Object.assign( {}, 
    { srcPath: './src', outputPath: './public', cleanUrls: true }, 
    options.build, {site: options.site || {}}, {template: options.template || {}}
  );

  // buildMode: full- build all files, incremental- build incremental since last build, &
  // buildMode: keyonly- build no files, only generate the last gen time key
  // for incremental builds read last gen time key to get last build time
  if (buildMode === 'incremental') {
    try {
      if (fse.existsSync(`${outputPath}/${gen}`)) {
        let hash = fse.readFileSync(`${outputPath}/${gen}`, 'utf-8');
        let decryptedGenTime = decrypt(JSON.parse(hash), secretKey);
        lastGenDate = new Date(Number(decryptedGenTime));
      } else {
        // full build if first build
        buildMode = 'full';
      }
    } catch {
      buildMode = 'full';
    }
  }

  // clear destination folder when full build
  if (buildMode === 'full') {
    fse.emptyDirSync(outputPath);
  }

  // keyonly build does not build pages, only creates or refreshes last gen time key
  // useful when changing the last gen time key without rebuilding any files
  // TODO: Add keyonly in documentation
  if (buildMode !== 'keyonly') {
    // copy assets folder for every build
    if (fse.existsSync(`${srcPath}/assets`)) {
      fse.mkdirsSync(`${outputPath}/assets`);
      fse.copySync(`${srcPath}/assets`, `${outputPath}/assets`);
    }

    // read all pages
    const files = glob.sync('**/*.@(md|ejs|html)', {
      cwd: `${srcPath}/pages`,
      ignore: ['**/layouts/**', '**/components/**', '**/js/**']
    });

    // Build selective pages only on build signal
    // if build signal, increment build count then build page
    // Note: genCount in middle and not after buildPage because _buildPage does not return anything
    files.forEach(
      file =>
        //console.log(`************${file}`) &&
        _generate(`${srcPath}/pages/${file}`, lastGenDate, includefiles, excludefiles) &&
        ++genCount &&
        _buildPage(file, { srcPath, outputPath, cleanUrls, site, template })
    );
  }

  // Create or refresh last gen time key as encrypted for next incremental build
  const hash = encrypt(genTime.getTime().toString(), secretKey);
  fse.writeFileSync(`${outputPath}/${gen}`, JSON.stringify(hash));

  // display build time
  const timeDiff = process.hrtime(startTime);
  const duration = timeDiff[0] * 1000 + timeDiff[1] / 1e6;
  log.success(`Site built succesfully in ${duration}ms for ${genCount} pages`);
};

/**
 * generate build signal
 */
const _generate = (file, lastGenDate, includefiles, excludefiles) => {
  // Skip if current file is not in selected file list
  let gen = includefiles.length === 0 || (includefiles.length > 0 && includefiles.includes(file));
  // skip and return if false build signal
  if (gen == false) return gen;

  // Skip if current file is in excluded file list
  gen = excludefiles.length === 0 || (excludefiles.length > 0 && !excludefiles.includes(file));
  // skip and return if false build signal
  if (gen == false) return gen;

  // Skip if current file is not newer than last generation time for incremental build
  gen =
    buildMode === 'full' ||
    (buildMode === 'incremental' && fse.statSync(file).mtime.getTime() >= lastGenDate.getTime());

  // return build signal
  return gen;
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

/**
 * Build a single page
 */
const _buildPage = (file, { srcPath, outputPath, cleanUrls, site, template }) => {
  log.info(`building - ${file}...`);
  const fileData = path.parse(file);
  // render complete page as well as page fragment for full loading vs partial (htmx) loading
  const pluginDir = fileData.dir.split('/')[0];
  let destPath = path.join(outputPath, fileData.dir);
  let fragmentPath = path.join(outputPath, 'views', fileData.dir);

  // create extra dir if generating clean URLs and filename is not index
  if (cleanUrls && fileData.name !== 'index') {
    destPath = path.join(destPath, fileData.name);
    fragmentPath = path.join(fragmentPath, fileData.name);
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
    delimiter: template.delimiter
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
  if (cleanUrls) {
    fse.writeFileSync(`${destPath}/index.html`, completePage);
    fse.writeFileSync(`${fragmentPath}/index.html`, fragmentPage);
  } else {
    fse.writeFileSync(`${destPath}/${fileData.name}.html`, completePage);
    fse.writeFileSync(`${fragmentPath}/${fileData.name}.html`, fragmentPage);
  }
};

module.exports = build;
