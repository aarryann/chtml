const entryComponents = require('../config/entry.config');

const entries = entryComponents.reduce((entryList, item) => {
  if(item.js)
    entryList[item.handle] = item.js;
  else if (item.css)
    entryList[item.handle] = item.css;
  return entryList;
}, {});

module.exports = entries;
  