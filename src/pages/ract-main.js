const ractTag = 'data-ract-';
const key = "ractfeeds";
/*
<tr>
  <td data-re-aria-labelledby="labelize(id)" data-re-content="labelize(id)"></td>
  <td><img class="h-10 w-10 rounded-full" data-re-src="avatar" data-re-alt="author"></td>
  <td><a href="#" data-re-content="author" class="hover:underline"></a></td>
  <td><a href="#" class="hover:underline"><time data-re-content="fulldate(date)" data-re-datetime="date"></time></a></td>
  <td data-re-content="title"></td>
  <td data-re-content="post"></td>
  <td data-re-content="shortened(likes)"></td>
  <td data-re-content="shortened(replies)"></td>
  <td data-re-content="shortened(views)"></td>
</tr>
*/

export function ractfeeds(data, decorator) {
  //data.forEach(row => {
    //ddRow( row, `${clone}`, decorators);
    //let func = new Function('row', 'clone', 'return `${clone}`;');
    //let updatedClone = func(row, clone);
    //console.log(updatedClone);

  //});
  //console.log(child);
  getFunc(data, decorator, child);
}

export function generateTemplate(){
  const template = document.querySelector(`template[data-ract-template="${key}"]`);
  const clone = template.content.cloneNode(true);
  const child = clone.children[0];
  let dataFields ={}, decoratorShell = {};

  getFunc(dataFields, decoratorShell, child);
}

function addData(data, decorator, rootNode) {
  const container = document.querySelector(`[data-ract-container="${key}"]`);
  const template = document.querySelector(`template[data-ract-template="${key}"]`);
  const clone = template.content.cloneNode(true);

  data.forEach(row => {
    let  id = row["id"], 
    author = row["author"], 
    avatar = row["avatar"], 
    date = row["date"], 
    title = row["title"], 
    post = row["post"], 
    likes = row["likes"], 
    replies = row["replies"], 
    views = row["views"];
    clone.children[0].setAttribute("aria-labelledby", decorator.labelize(id));
    clone.children[0].innerHTML = decorator.labelize(id);
    clone.children[1].children[0].setAttribute("src", avatar);
    clone.children[1].children[0].setAttribute("alt", author);
    clone.children[2].children[0].innerHTML = author;
    clone.children[3].children[0].children[0].innerHTML = decorator.fulldate(date);
    clone.children[3].children[0].children[0].setAttribute("datetime", date);
    clone.children[4].innerHTML = title;
    clone.children[5].innerHTML = post;
    clone.children[6].innerHTML = decorator.shortened(likes);
    clone.children[7].innerHTML = decorator.shortened(replies);
    clone.children[8].innerHTML = decorator.shortened(views);

    container.appendChild(clone);
  });
}

function getFunc(data, decorator, node){
  if(data.length == 0) return "";
  let codeScript = "", dataFields = new Set();
  const setterCode = generateSetterCode(node, dataFields);

  for (const key of dataFields) {
    // Do something with object[key]
    codeScript += `  ${key} = row["${key}"], \n`;
  }
  codeScript = (`  let${codeScript};`).replace(", \n;", ";\n") + setterCode;
  codeScript = `data.forEach(row => {console.log(row);\n${codeScript}});return clone;`;
  let func = new Function('data', 'decorator', 'clone', codeScript);
  let result = func(data, decorator, node);
  console.log(result);
  console.log(codeScript);
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
/*
function addRow(row, clone, decorator){
  let id = row["id"]
  , avatar = row["avatar"]
  , author = row["author"]
  , date = row["date"]
  , title = row["title"]
  , post = row["post"]
  , likes = row["likes"]
  , replies = row["replies"]
  , views = row["views"];

  let val;
  clone = clone.replace(
    /data-re-(?<attrib>[^="']+).{1,2}(?<value>[^\s"'\(]+).(?<param>[^\s\)"'>]+)?["'\)]{0,2}/g,
    (match, attrib, value, param) => {
      // if param, its a function
      if(param){
        val = `${attrib}="${decorator[value](row[param])}"`;
      }else{
        val = `${attrib}="${row[value]}"`;
      }

      //console.log(`${match} ${val}`);
      return `${match} ${val}`;
    }
  );
  console.log(clone);
}
*/