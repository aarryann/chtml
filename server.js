const express = require("express");
const chtml = require("./chtml");
const feedAlpine = require("./feeds-alpine");
const fs = require("fs");
const app = express();

app.set("views", "./public");
app.set("view engine", "html");

// Serve static HTML files using the HTML commenting template engine
//app.use(express.static("public"));

app.get("/", (req, res) => {
  const templatePath = "./public/index.html";

  fs.readFile(templatePath, "utf-8", (err, html) => {
    if (err) {
      res.status(500).send("Error loading template");
      return;
    }

    const context = {
      title: "My Website",
      showHeader: () => true,
      header: "Welcome to My Website-1",
      showSubheader: () => true,
      subheader: "Check out these cool items-2:",
      showSubSubheader: () => true,
      subsubheader: "And check these out too-3:",
      items: ["Item 1", "Item 2", "Item 3"],
      itemsLength: () => `There are ${context.items.length} items`,
      linker: (html) =>{ return feedAlpine.linkFeed(html) }
    };

    const renderedHtml = chtml.render(html, context);

    res.send(renderedHtml);
  });
});

// Start the server
app.listen(3000, () => console.log("Server running on port 3000"));
