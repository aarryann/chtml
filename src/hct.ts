const fs = require("fs");
const BLOCK_START = "<!--{#";
const PLACEHOLDER_START = "<!--{";
const BLOCK_END = "<!--{/";

function render(html: string, context: any) {
  if(!context){
    context = {};
    // if context is not provided, check whether context exists in page
    // extract the source and get it.
    html = html.replace(
      /<!--\{#context\s+src=(?<beginquote>['"])(?<src>.+?)(?<endquote>\1)\s+\/\}-->/g,
      (_match, _beginquote, src, _endquote) => {
        context = Object.assign( {}, context , require(src).context);
        return "";
      }
    );
  }
  // Replace each placeholder with its value from the context object
  const compiledArr = [];

  const htmlArr = html.split(BLOCK_START);
  // The templated content if any will be from the second row
  if (htmlArr.length > 0) {
    compiledArr.push( parse( htmlArr.shift(), context ) );
  }
  // Now parse any outer code blocka.The contol will return back only when one entire outer block is parsed, including all its nested inner blocks.
  while (htmlArr.length > 0) {
    compiledArr.push(parseBlock(htmlArr.shift(), htmlArr, context));
  }
  return compiledArr.join("");
}

function getContext(html: string){
  html = html.replace(
    /<!--\{#context\s+src=(?<beginquote>['"])(?<src>.+?)(?<endquote>\1)\s+\/\}-->/g,
    (_match, _beginquote, _src, _endquote) => {
      // Invoke the function, pass the enclosed HTML as argument and render the returned value
      //return context[callee](fragment);
      return "";
    }
  );
}

function parseBlock(codeBlock: string | undefined, htmlArr: Array<string>, context: any) {
  // if pure html return
  if (codeBlock && codeBlock.startsWith("<")) {
    return codeBlock;
  }
  const blockArr = (codeBlock && codeBlock.split(BLOCK_END)) || [];
  // if blockArr length is 1 or block end is not found, it either the block is not complete yet, i.e there is a nested bloc after this codeblock
  if (blockArr.length === 1) {
    codeBlock += parseBlock(htmlArr.shift(), htmlArr, context);
  }
  // if not nested block, parse end value
  return parse(codeBlock || "", context);
}

function parse(template: string | undefined, context: any) : string {
  // Replace each placeholder with its value from the context object
  let html = template || "";

  // Replace each #call block with its rendered contents from execution of called function
  html = html.replace(
    /call (.+?)\}-->([\s\S]*?)<!--\{\/call\}-->/g,
    (_match, callee, fragment) => {
      // Invoke the function, pass the enclosed HTML as argument and render the returned value
      return context[callee](fragment);
    }
  );

  // Replace each #each block with its rendered contents
  html = html.replace(
    /each (.+?)\}-->([\s\S]*?)<!--\{\/each\}-->/g,
    (_match, arrayKey, itemTemplate) => {
      // Get the array to iterate over from the context object
      const array = context[arrayKey];
      // Render the item template for each item in the array
      console.log(array);
      const renderedItems = array.map((item: string) => {
        // Create a new context object for each item
        const itemContext = Object.assign({}, context, { this: item });
        // Render the item template using the item context object
        return parse(itemTemplate, itemContext);
      });
      // Join the rendered items into a single string and return it as the replacement for the #each block
      return renderedItems.join("");
    }
  );

  // Replace each #if block with its rendered contents (if the condition is true) or an empty string (if the condition is false)
  html = html.replace(
    /if (.+?)\}-->([\s\S]*?)<!--\{\/if\}-->/g,
    (_match, condition, content) => {
      // Evaluate the condition as a JavaScript expression using the context object
      const isTrue = context[condition]();
      // If the condition is true, render the content
      if (isTrue) {
        return parse(content, context);
      }
      // Otherwise, return an empty string as the replacement for the #if block
      return "";
    }
  );

  html = html.replace(/<!--\{([^\/].+?)\}-->/g, (_match, placeholder) => {
    // Split the placeholder into an array of keys (for nested values)
    const keys = placeholder.split(".");
    // Start with the top-level context object
    let value = context;
    // Traverse down the keys to get the final value
    keys.forEach((key: string) => {
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

module.exports = {
  render,
};
