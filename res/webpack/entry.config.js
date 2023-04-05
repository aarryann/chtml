// Get the js files from src folder and html file from gen folder (also check HtmlWebpackPlugin)
const browserEntry = [
  {
    "handle": "main",
    "js": ["/dist/pages/main", "/dist/share/data/feed-data-new", "/src/pages/ract-main"], 
    "html": "/index.html"
  },
  {
    "handle": "feeds", 
    "js": "/dist/pages/feed/main.feed", 
    "html": "/feed/index.html"
  },
  {
    "handle": "about", 
    "js": "/dist/pages/about/main.about", 
    "html": "/about/index.html"
  },
  {
    "handle": "tailwind", 
    "css": "/src/main.css"
  },
];

module.exports = {
  browserEntry,
}