const feedAlpine = require("../../lib/feeds/feeds-alpine");
const jsdom = require("jsdom");

const context = {
  title: "Feeds",
  linker: (html) =>{ 
    const { JSDOM } = jsdom;
    const dom = new JSDOM(html);
  
    return feedAlpine.linkFeed(dom.window.document) 
  }
};

module.exports = context;