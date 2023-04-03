const feedAlpine = require("./main.feed");
const jsdom = require("jsdom");

export const context = {
  title: "Feeds",
  linker: (html: string) =>{ 
    const { JSDOM } = jsdom;
    const dom = new JSDOM(html);
  
    return feedAlpine.linkFeed(dom.window.document) 
  }
};

//module.exports = context;