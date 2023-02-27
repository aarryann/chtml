const fs = require("fs");
const BLOCK_START = "<!--{#";
const BLOCK_END = "<!--{/";

function parseTemplatedBlock(codeBlock, htmlArr, context){
  const blockArr = codeBlock.split(BLOCK_END);
  // if blockArr length is 1, it mmeans the block is not ending in this statement
  // which means its  nested block. For nested block parse next blockstatement
  if (blockArr.length === 1){
    return parseTemplatedBlock(cleanBlockStart(htmlArr.shift()), context);
  } else {
    // if not nested block, parse end value
    const parsed = parseFieldValue(cleanBlockStart(blockArr.shift()));
    return parsed + cleanBlockEnd(blokArr.join(BLOCK_END);
  }
 
  return parseFieldValue(codeBlock, context);
  
}

function parseFieldValue(html, context){
  html = html.replace(/<!--\{(.+?)\}-->/g, (match, placeholder) => {
    //console.log(`${match} ++++ ${placeholder} ++++ `);
    // Split the placeholder into an array of keys (for nested values)
    const keys = placeholder.split(".");
    // Start with the top-level context object
    let value = context;
    // Traverse down the keys to get the final value
    keys.forEach((key) => {
      value = value[key];
    });
    // If the value is a function, execute it and return the result
    if (typeof value === "function") {
      value = value();
    }
    // Return the final value as the replacement for the placeholder
    return value;
  });
}

function cleanBlockStart(block){
  return block
}

function cleanBlockEnd(block){
  return block
}

function render(template, context) {
  // Replace each placeholder with its value from the context object
  let html = template;

  const htmlArr = html.split(BLOCK_START);
  while (htmlArr.length > 0){
    const blockStatement = cleanBlockStart(htmlArr.shift());
    const blockArr = blockStatement.split(BLOCK_END);
    // if blockArr length is 1, it mmeans the block is not ending in this statement
    // which means its  nested block. For nested block parse next blockstatement
    if (blockArr.length === 1){
      parseTemplatedBlock(cleanBlockStart(htmlArr.shift()), context);
    } else {
      // if not nested block, parse end value
      const parsed = parseFieldValue(blockArr.shift());
      return parsed + cleanBlockEnd(blokArr.join(BLOCK_END);
    }
  }

  // Replace each #each block with its rendered contents
  html = html.replace(
    /<!--\{#each (.+?)\}-->([\s\S]*?)<!--\{\/each\}-->/g,
    (match, arrayKey, itemTemplate) => {
      // Get the array to iterate over from the context object
      const array = context[arrayKey];
      // Render the item template for each item in the array
      const renderedItems = array.map((item) => {
        // Create a new context object for each item
        const itemContext = Object.assign({}, context, { this: item });
        // Render the item template using the item context object
        return render(itemTemplate, itemContext);
      });
      // Join the rendered items into a single string and return it as the replacement for the #each block
      return renderedItems.join("");
    }
  );

  // Replace each #if block with its rendered contents (if the condition is true) or an empty string (if the condition is false)
  //console.log(html);
  html = html.replace(
    /<!--\{#if (.+?)\}-->([\s\S]*?)<!--\{\/if\}-->/g,
    (match, condition, content) => {
      //console.log(`if ${content}`);
      //console.log(`if ${condition} ${content}`);
      // Evaluate the condition as a JavaScript expression using the context object
      //const isTrue = evalInContext(condition, context);
      const isTrue = context[condition]();
      // If the condition is true, render the content
      if (isTrue) {
        return render(content, context);
      }
      // Otherwise, return an empty string as the replacement for the #if block
      return "";
    }
  );

  //console.log(html);

  html = html.replace(/<!--\{(.+?)\}-->/g, (match, placeholder) => {
    //console.log(`${match} ++++ ${placeholder} ++++ `);
    // Split the placeholder into an array of keys (for nested values)
    const keys = placeholder.split(".");
    // Start with the top-level context object
    let value = context;
    // Traverse down the keys to get the final value
    keys.forEach((key) => {
      value = value[key];
    });
    // If the value is a function, execute it and return the result
    if (typeof value === "function") {
      value = value();
    }
    // Return the final value as the replacement for the placeholder
    return value;
  });

  // Return the final rendered HTML
  return html;
}

// A utility function to evaluate a JavaScript expression in a given context object
function evalInContext(js, context) {
  //# Return the result of the evaluated expression
  return function () {
    return eval(js);
  }.call(context);
}

module.exports = {
  render,
};
