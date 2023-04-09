// Get the js files from src folder and html file from gen folder (also check HtmlWebpackPlugin)
const browserEntry = [
  {
    "handle": "main",
    "js": ["/dist/pages/index.home"], 
    "dependencies": [],
    "html": "/index.html"
  },
  {
    "handle": "feeds", 
    "js": "/dist/pages/feed/index.feed", 
    "dependencies": [],
    "html": "/feed/index.html"
  },
  {
    "handle": "about", 
    "js": "/dist/pages/about/index.about", 
    "dependencies": [],
    "html": "/about/index.html"
  },
  {
    "handle": "tailwind", 
    "dependencies": [],
    "css": "/src/main.css"
  },
];

module.exports = {
  browserEntry,
}