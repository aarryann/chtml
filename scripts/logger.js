const chalk = require('chalk');

module.exports = {
  info(message) {
    console.log(chalk`{gray [go]} ${message}`);
  },

  success(message) {
    console.log(chalk`{gray [go]} {green ${message}}`);
  },

  error(message) {
    console.log(chalk`{gray [go]} {red ${message}}`);
  }
};