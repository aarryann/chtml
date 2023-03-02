const express = require('express');
const { render } = require('./chtml');
const fs = require('fs');
const app = express();

// Set the view engine to use the HTML commenting template engine
/*
app.engine('html', (filePath, options, callback) => {
  fs.readFile(filePath, (err, content) => {
    if (err) return callback(err);
    const rendered = render(content.toString(), options);
    return callback(null, rendered);
  });
});
*/

//app.set('views', './public');
app.set('view engine', 'html');

// Serve static HTML files using the HTML commenting template engine
app.use(express.static('public'));

/*
// Route for the home page
app.get('/', (req, res) => {
  const data = {
    title: 'Home Page',
    showHeader: true,
    header: 'Welcome to my website!',
    showSubheader: false,
    items: ['Item 1', 'Item 2', 'Item 3'],
    itemsLength: function() {
      return `There are ${this.items.length} items in the list`;
    }
  };
  res.render('index', data);
});

// Route for the about page
app.get('/about', (req, res) => {
  const data = {
    title: 'About Us',
    showHeader: true,
    header: 'About Us',
    showSubheader: true,
    subheader: 'Learn more about us',
    items: ['Our mission', 'Our team', 'Our history'],
    itemsLength: function() {
      return `There are ${this.items.length} items in the list`;
    }
  };
  res.render('about', data);
});
*/

// Start the server
app.listen(5000, () => console.log('Server running on port 5000'));
