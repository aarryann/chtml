const browserEntry = [
  {"handle": "main",  "js": "/lib/index"              , "html": "/index.html"},
  {"handle": "feeds", "js": "/lib/feeds/feeds-alpine" , "html": "/feeds/index.html"},
  {"handle": "about", "js": "/lib/about/index"        , "html": "/about/index.html"},
  {"handle": "feed-data-new", "js": "/res/data/feed-data-new"},
  {"handle": "tailwind", "css": "/src/main.css"},
];

const nodeEntry = ["/lib/index", "/lib/feeds/feeds-alpine", "/lib/about/index"];

module.exports = {
  browserEntry,
  nodeEntry
}