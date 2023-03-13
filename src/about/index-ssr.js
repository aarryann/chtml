
const context = {
  title: "About",
  showHeader: () => true,
  header: "Welcome to About",
  showSubheader: () => true,
  subheader: "About page:",
  showSubSubheader: () => true,
  subsubheader: "Good about:",
  items: ["Item 1", "Item 2", "Item 3"],
  itemsLength: () => `There are ${context.items.length} items`,
};

module.exports = context;
