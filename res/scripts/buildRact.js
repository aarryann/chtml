require('dotenv').config();
const fse = require('fs-extra');
const path = require('path');
const frontMatter = require('front-matter');
const glob = require('glob');
const log = require('./logger');
const siteoptions = require('../conf/site.config');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const ractTag = 'data-ract-';
const prettier = require("prettier");

/**
 * Build the site
 */
const buildRact = (options = siteoptions || {}) => {
  log.info('Building site...');
  const startTime = process.hrtime();

  const { srcPath, outputPath, cleanUrls, site, template, includefiles, excludefiles } = Object.assign( {}, 
    { srcPath: './src', outputPath: './public', cleanUrls: true }, 
    options.build, {site: options.site || {}}, {template: options.template || {}}
  );

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
  const fileData = path.parse(file);
  const sourceFilePath = `${srcPath}/pages/${file}`;
  const destFilePath = `${srcPath}/pages/${fileData.dir}/${fileData.name}.ract.js`;

  const templateMtimeMs = fse.statSync(sourceFilePath).mtimeMs;
  const outputExists = fse.existsSync(destFilePath);
  const outputMtimeMs = outputExists ? fse.statSync(destFilePath).mtimeMs : 0;

  if (templateMtimeMs <= outputMtimeMs) {
    log.info(`skipping ract - ${file}...`);
    return;
  }

  const data = fse.readFileSync(`${sourceFilePath}`, 'utf-8');
  const pageData = frontMatter(data);
  const dom = new JSDOM(pageData.body);

  const tplArr = dom.window.document.querySelectorAll(`template[${ractTag}template]`);
  if (!tplArr){
    return;
  }

  let clone, child, key, keyFound = false, tplAttr, tAtt;

  let pageContent = "";
  tplArr.forEach(tpl=>{
    key = "";
    keyFound = false;
    tplAttr = tpl.attributes;
    for(let i=0; i < tplAttr.length; i++){
      tAtt = tplAttr[i];
      if(tAtt.name === `${ractTag}template`){
        key = tAtt.value;
        keyFound = true;
      }
    }

    if(!keyFound) return;
    clone = tpl.content.cloneNode(true);
    child = clone.children[0];
    pageContent += getFunc(child, key);
  })
  if(pageContent.length === 0) return;

  log.info(`building ract - ${file}...`);
  pageContent = prettier.format(pageContent, { parser: 'babel' });

  fse.writeFileSync(`${destFilePath}`, pageContent);
};

function getFunc(node, key){
  let codeScript = "", dataFields = new Set();
  const setterCode = generateSetterCode(node, dataFields);

  for (const key of dataFields) {
    // Do something with object[key]
    codeScript += `  ${key} = row["${key}"], \n`;
  }

  codeScript = 
   (`let${codeScript};`).replace(", \n;", ";\n\n") + setterCode;
  
  codeScript = 
  `export function ${key}(data, decorator) {
    ${key}AddData(data, decorator);
  }
  function ${key}AddData(data, decorator) {
    const container = document.querySelector('[${ractTag}container="${key}"]');
    const template = document.querySelector('template[${ractTag}template="${key}"]');
    const clone = template.content.cloneNode(true);

    data.forEach(row => {
      ${codeScript}

      container.appendChild(clone);
    });
  }`;

  return codeScript;
}

function generateSetterCode(node, dataFields, currentIndex = -1, codeScript = "", lineageTag = ""){
  let i;
  let nodePropList = node.attributes || [];
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
