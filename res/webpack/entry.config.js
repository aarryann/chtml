// Get the js files from src folder and html file from gen folder (also check HtmlWebpackPlugin)
const browserEntry = [
  {
    "handle": "main",
    "js": ["/src/pages/index.home"], 
    "dependencies": [],
    "html": "/index.html"
  },
  {
    "handle": "feeds", 
    "js": "/src/pages/feed/index.feed", 
    "dependencies": [],
    "html": "/feed/index.html"
  },
  {
    "handle": "about", 
    "js": "/src/pages/about/index.about", 
    "dependencies": [],
    "html": "/about/index.html"
  },
  {
    "handle": "tailwind", 
    "dependencies": [],
    "css": "/src/assets/css/tailwind.css"
  },
];

module.exports = {
  browserEntry,
}