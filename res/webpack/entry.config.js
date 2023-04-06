// Get the js files from src folder and html file from gen folder (also check HtmlWebpackPlugin)
const browserEntry = [
  {
    "handle": "main",
    "js": ["/dist/pages/main"], 
    "dependencies": [],
    "html": "/index.html"
  },
  {
    "handle": "feeds", 
    "js": "/dist/pages/feed/main.feed", 
    "dependencies": [],
    "html": "/feed/index.html"
  },
  {
    "handle": "about", 
    "js": "/dist/pages/about/main.about", 
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