const home = require("./index.home");
const jsdom = require("jsdom");

export const context = {
  title: "Home",
  showHeader: () => true,
  header: "Welcome to My Website",
  showSubheader: () => true,
  subheader: "Check out these cool items-2:",
  showSubSubheader: () => true,
  subsubheader: "And check these out too-3:",
  items: ["Item 1", "Item 2", "Item 3"],
  itemsLength: () => `There are ${context.items.length} items`,
  getHomeDataset: (html: string) =>{ 
    const { JSDOM } = jsdom;
    const dom = new JSDOM(html);
  
    return home.dataBind(dom.window.document) 
  }
};
