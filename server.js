const express = require("express");
const chtml = require("./chtml");
const fs = require("fs");
const app = express();

// Set the view engine to use the HTML commenting template engine
/*
app.engine("html", (filePath, options, callback) => {
  console.log("hit");
  fs.readFile(filePath, (err, content) => {
    if (err) return callback(err);
    const rendered = render(content.toString(), options);
    return callback(null, rendered);
  });
});
*/
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
    };

    const renderedHtml = chtml.render(html, context);

    res.send(renderedHtml);
  });
});

app.get("/check1", (req, res) => {
  const templatePath = "./public/index.html";

  fs.readFile(templatePath, "utf-8", (err, data) => {
    if (err) {
      res.status(500).send("Error loading template");
      return;
    }

    const template = chtml.compile(data);
    const context = {
      title: "My Website",
      showHeader: true,
      header: "Welcome to My Website",
      showSubheader: true,
      subheader: "Check out these cool items:",
      items: ["Item 1", "Item 2", "Item 3"],
      itemsLength: `<!--{${() => `There are ${this.items.length} items`}-->`,
    };

    const renderedHtml = template(context);

    res.send(renderedHtml);
  });
});

// Route for the home page
app.get("/check", (req, res) => {
  const data = {
    title: "Home Page",
    showHeader: () => true,
    header: "Welcome to my website!",
    showSubheader: () => true,
    subheader: "Check oout these items!",
    items: ["Item 1", "Item 2", "Item 3"],
    itemsLength: function () {
      return `There are ${this.items.length} items in the list`;
    },
  };
  res.render("index", data);
});

// Route for the about page
app.get("/about", (req, res) => {
  const data = {
    title: "About Us",
    showHeader: true,
    header: "About Us",
    showSubheader: true,
    subheader: "Learn more about us",
    items: ["Our mission", "Our team", "Our history"],
    itemsLength: function () {
      return `There are ${this.items.length} items in the list`;
    },
  };
  res.render("about", data);
});

// Start the server
app.listen(3000, () => console.log("Server running on port 3000"));
