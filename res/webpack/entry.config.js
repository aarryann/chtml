// Get the js files from src folder and html file from gen folder (also check HtmlWebpackPlugin)
const browserEntry = [
  {"handle": "main",  "js": "/dist/pages/main"             , "html": "/index.html"},
  {"handle": "feeds", "js": "/dist/pages/feed/main.feed"   , "html": "/feed/index.html"},
  {"handle": "about", "js": "/dist/pages/about/main.about" , "html": "/about/index.html"},
  {"handle": "feed-data-new", "js": "/dist/share/data/feed-data-new"},
  {"handle": "tailwind", "css": "/src/main.css"},
];

//const nodeEntry = ["/src/pages/index.controller", "/src/pages/feed/index.controller", "/src/pages/about/index.controller"];

module.exports = {
  browserEntry,
  //nodeEntry
}