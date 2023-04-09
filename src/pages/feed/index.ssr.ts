const feedAlpine = require("./index.feed");
const jsdom = require("jsdom");

export const context = {
  title: "Feeds",
  getFeedDataset: (html: string) =>{ 
    const { JSDOM } = jsdom;
    const dom = new JSDOM(html);
  
    return feedAlpine.dataBind(dom.window.document) 
  }
};

//module.exports = context;