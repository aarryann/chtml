"use strict";
const ractTag = 'data-re-';
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

function ractfeeds(data, decorators) {
  const key = "ractfeeds";
  const template = document.querySelector(`template[data-ract-id="${key}"]`);
  const clone = template.content.cloneNode(true);
  const child = clone.children[0];
  //data.forEach(row => {
    //ddRow( row, `${clone}`, decorators);
    //let func = new Function('row', 'clone', 'return `${clone}`;');
    //let updatedClone = func(row, clone);
    //console.log(updatedClone);

  //});
  //console.log(child);
  let codeScript = "";
  let lineageTag = "";
  let currentIndex = -1;
  codeScript = generateSetterCode(child, currentIndex, codeScript, lineageTag);
  console.log(codeScript);
};

function generateSetterCode(node, currentIndex, codeScript, lineageTag){
  let i;
  let nodePropList = node.attributes;
  let nodeProp, attribValue, attribName, formedValue;
  let found = false;
  if(currentIndex >= 0){
    lineageTag += `.children[${currentIndex}]`;
  }
  // Loop through attributes and identify whether there are any ract attributes
  for(i=0; i < nodePropList.length; i++){
    nodeProp = nodePropList[i];
    // if you find the ractTag, add it to generated code
    if(nodeProp.name.indexOf(ractTag) === 0){
      // for a node index, process only once
      if(!found){
        //lineageTag += `.children[${currentIndex}]`;
        //found = true;
      }
      attribValue = nodeProp.value;
      attribName = nodeProp.name.replace(ractTag, '');
      if(attribValue.indexOf('(') > 0){
        // if its a function
        formedValue = `decorator.${attribValue}`;
      } else {
        formedValue = `row.${attribValue}`;
      }
      if(attribName === 'content'){
        codeScript += `rootNode${lineageTag}.innerHTML = ${formedValue};`;
      } else {
        codeScript += `rootNode${lineageTag}.setAttribute("${attribName}", ${formedValue});`;
      }
    }
  }
  nodePropList = node.children;
  for(i=0; i < nodePropList.length; i++){
    nodeProp = nodePropList[i];
    if(!found){
      //lineageTag += `.children[${currentIndex}]`;
      found = true;
    }
    codeScript = generateSetterCode(nodeProp, i, codeScript, lineageTag)
  }
  return codeScript;
}

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

module.exports = {
  ractfeeds
}