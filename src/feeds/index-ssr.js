const feedAlpine = require("../../lib/feeds/feeds-alpine");

const context = {
  title: "Feeds",
  linker: (html) =>{ return feedAlpine.linkFeed(html) }
};

module.exports = context;