
const context = {
  title: "Home",
  showHeader: () => true,
  header: "Welcome to My Website",
  showSubheader: () => true,
  subheader: "Check out these cool items-2:",
  showSubSubheader: () => true,
  subsubheader: "And check these out too-3:",
  items: ["Item 1", "Item 2", "Item 3"],
  itemsLength: () => `There are ${context.items.length} items`,
};

module.exports = context;
