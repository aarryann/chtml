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
const jsdom = require("jsdom");

/**
 * Build the site
 */
const buildRact = (options = siteoptions || {}) => {
  log.info('Building site...');
  const startTime = process.hrtime();

    // read all pages
    const files = glob.sync('**/*.@(ejs|html)', {
      cwd: `${srcPath}/pages`,
      ignore: ['**/layouts/**', '**/components/**', '**/js/**']
    });

    // Build selective pages only on build signal
    // if build signal, increment build count then build page
    // Note: genCount in middle and not after buildPage because _buildPage does not return anything
    files.forEach(file =>
      _buildPage(file, { srcPath, outputPath, cleanUrls, site, template })
    );

  // display build time
  const timeDiff = process.hrtime(startTime);
  const duration = timeDiff[0] * 1000 + timeDiff[1] / 1e6;
  log.success(`Site built succesfully in ${duration}ms`);
};

/**
 * Build a single page
 */
const _buildPage = (file, { srcPath, outputPath, cleanUrls, site, template }) => {
  log.info(`building - ${file}...`);
  const fileData = path.parse(file);

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
      case '.html':
      case '.ejs':
      pageContent = ejs.render(pageData.body, Object.assign({}, templateConfig, {
        filename: `${srcPath}/page-${pageSlug}`
      }));
      break;
    default:
      pageContent = pageData.body;
  }

  const { JSDOM } = jsdom;
  const dom = new JSDOM(pageContent);

  const template = document.querySelector(`template[data-ract-template="${key}"]`);
  const clone = template.content.cloneNode(true);
  const child = clone.children[0];
  let dataFields ={}, decoratorShell = {};

  pageContent = getFunc(dataFields, decoratorShell, child);

  fse.writeFileSync(`${fileData.dir}/${fileData.name}.ract.js`, pageContent);
};

function getFunc(node){
  let codeScript = "", dataFields = new Set();
  const setterCode = generateSetterCode(node, dataFields);

  for (const key of dataFields) {
    // Do something with object[key]
    codeScript += `  ${key} = row["${key}"], \n`;
  }
  codeScript = (`  let${codeScript};`).replace(", \n;", ";\n") + setterCode;
  codeScript = `data.forEach(row => {console.log(row);\n${codeScript}});return clone;`;

  return codeScript;
}

function generateSetterCode(node, dataFields, currentIndex = -1, codeScript = "", lineageTag = ""){
  let i;
  let nodePropList = node.attributes;
  let nodeProp, attribValue, attribName, formedValue;
  if(currentIndex >= 0){
    lineageTag += `.children[${currentIndex}]`;
  }
  // Loop through attributes and identify whether there are any ract attributes
  for(i=0; i < nodePropList.length; i++){
    nodeProp = nodePropList[i];
    // if you find the ractTag, add it to generated code
    if(nodeProp.name.indexOf(ractTag) === 0){
      // for a node index, process only once
      attribValue = nodeProp.value;
      attribName = nodeProp.name.replace(ractTag, '');
      if(attribValue.indexOf('(') > 0){
        // if its a function
        formedValue = `decorator.${attribValue}`;
      } else {
        formedValue = attribValue;
        dataFields.add(attribValue);
      }
      if(attribName === 'content'){
        codeScript += `  clone${lineageTag}.innerHTML = ${formedValue};\n`;
      } else {
        codeScript += `  clone${lineageTag}.setAttribute("${attribName}", ${formedValue});\n`;
      }
    }
  }
  nodePropList = node.children;
  for(i=0; i < nodePropList.length; i++){
    nodeProp = nodePropList[i];
    codeScript = generateSetterCode(nodeProp, dataFields, i, codeScript, lineageTag)
  }
  return codeScript;
}

module.exports = buildRact;
