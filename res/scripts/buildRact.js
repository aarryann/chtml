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
const hct = require("../../dist/hct");

/**
 * Build the site
 */
const buildRact = (options = siteoptions || {}) => {
  log.info('Building ract...');
  const startTime = process.hrtime();

  const { build: {srcPath, outPath, regen}} = {
    build: Object.assign({}, siteoptions.build, options.build),
  };
  
  // read all pages
  const files = glob.sync('**/*.@(ejs|html)', {
    cwd: `${srcPath}/pages`,
    ignore: ['**/layouts/**', '**/components/**', '**/js/**']
  });

  files.forEach(file =>
    _buildPage(file, { srcPath, outPath, regen })
  );

  // display build time
  const timeDiff = process.hrtime(startTime);
  const duration = timeDiff[0] * 1000 + timeDiff[1] / 1e6;
  log.success(`Site built succesfully in ${duration}ms`);
};

/**
 * Build a single page
 */
const _buildPage = (file, { srcPath, outPath, regen }) => {
  const fileData = path.parse(file);
  const sourceFilePath = `${srcPath}/pages/${file}`;
  const destFilePath = `${outPath}/pages/${fileData.dir}/${fileData.name}.ract.js`;

  const srcMtimeMs = fse.statSync(sourceFilePath).mtimeMs;
  const outputExists = fse.existsSync(destFilePath);
  const outputMtimeMs = outputExists ? fse.statSync(destFilePath).mtimeMs : 0;

  if (!regen && srcMtimeMs <= outputMtimeMs) {
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
    //pageContent += getFunc(child, key);
    pageContent += codeGen(child, key);
  })
  if(pageContent.length === 0) return;

  log.info(`building ract - ${file}...`);
  pageContent = prettier.format(pageContent, { parser: 'babel' });

  fse.writeFileSync(`${destFilePath}`, pageContent);
};

function codeGen(node, key){
  const templateFilePath = `./res/scripts/ract.template.txt`;
  let codeScript = "", dataFields = new Set();
  const setterCode = generateSetterCode(node, dataFields);

  const context = {
    ractkey: key,
    items: Array.from(dataFields),
    setterCode
  }

  try {
    const tpl = fse.readFileSync(templateFilePath, 'utf-8');
    codeScript = hct.render(tpl, context);
  } catch (e) {
    codeScript = `Error loading template - ${e.message}`;
  }

  return codeScript;
}

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
    let clone, rootNode;

    data.forEach(row => {
      clone = template.content.cloneNode(true);
      rootNode = clone.children[0];
      ${codeScript}

      container.appendChild(rootNode);
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
        attribValue.split(/[\(\),]/).forEach((val, j)=>{
          if(val.length > 0 && j > 0){
            dataFields.add(val);
          }
        })
      } else {
        formedValue = attribValue;
        dataFields.add(attribValue);
      }
      if(attribName === 'content'){
        codeScript += `  rootNode${lineageTag}.innerHTML = ${formedValue};\n`;
      } else {
        codeScript += `  rootNode${lineageTag}.setAttribute("${attribName}", ${formedValue});\n`;
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
