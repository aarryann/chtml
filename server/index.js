const express = require("express");
const hct = require("../hct");
const fs = require("fs");
const app = express();
const path = require('path');

app.set("view engine", "html");

const hctRoute = (req, res) => {
  let pagePath = path.join('public', req.path, ".html").replace("/.html", ".html");
  //let contextPath = path.join('./public/js', req.path, "-ssr.js").replace("/-ssr.js", "-ssr.js");

  if (!fs.existsSync(pagePath)){
    pagePath = path.join('public', req.path, "index.html");
    //contextPath = path.join('./public/js', req.path, "index-ssr.js");
    if (!fs.existsSync(pagePath)){
      res.status(404).send("Page not Found");
      return;
    }
  }

  fs.readFile(pagePath, "utf-8", (err, html) => {
    if (err) {
      res.status(500).send("Error loading template");
      return;
    }

    //const context = require(`./${contextPath}`) || {};
    const renderedHtml = hct.render(html);

    res.send(renderedHtml);
  });
};

// Serve static HTML files using the HTML commenting template engine
app.get("/", hctRoute);

app.get("/feed/", hctRoute);

app.use(express.static("public"));

// Start the server
app.listen(3000, () => console.log("Server running on port 3000"));
