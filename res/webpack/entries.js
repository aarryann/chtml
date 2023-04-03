const entryConf = require('./entry.config');

const browserEntries = entryConf.browserEntry.reduce((entryList, item) => {
  if(item.js)
    entryList[item.handle] = item.js;
  else if (item.css)
    entryList[item.handle] = item.css;
  return entryList;
}, {});

module.exports = {
  browserEntries,
  //nodeEntries: entryConf.nodeEntry
}
  