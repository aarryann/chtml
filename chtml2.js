// Define a render function that accepts a template and data object
function render(template, data) {
  // Use a regular expression to find all the placeholders in the template
  const placeholderRegex = /<!--{(.+?)}-->/g;
  // Use a regular expression to find all the block start placeholders in the template
  const blockStartRegex = /<!--{#(.+?)}-->/g;
  // Use a regular expression to find all the block end placeholders in the template
  const blockEndRegex = /<!--{\/(.+?)}-->/g;

  // Replace all placeholders with their corresponding values from the data object
  const html = template.replace(placeholderRegex, (_, key) => data[key]);

  // Replace all block placeholders with their corresponding values from the data object
  const blocks = {};

  // Find all block start placeholders in the template
  const blockStartMatches = html.matchAll(blockStartRegex);
  for (const match of blockStartMatches) {
    // Get the name of the block from the placeholder
    const blockName = match[1];
    // Find the corresponding block end placeholder
    const blockEndRegexString = `<!--{/${blockName}}-->`;
    const blockEndMatch = html.match(blockEndRegexString);
    if (!blockEndMatch) {
      throw new Error(`No matching end block for ${blockName} found.`);
    }
    // Get the contents of the block, which is everything between the start and end placeholders
    const blockContent = html.slice(
      match.index + match[0].length,
      blockEndMatch.index
    );
    // Add the block content to the blocks object using the block name as the key
    blocks[blockName] = blockContent.trim();
    // Remove the block content and start/end placeholders from the HTML
    html = html.replace(match[0] + blockContent + blockEndMatch[0], "");
  }

  // Replace all block value placeholders with their corresponding values from the data object
  for (const [blockName, blockValue] of Object.entries(data)) {
    // If the value is a function, call it with the blocks object as an argument
    if (typeof blockValue === "function") {
      data[blockName] = blockValue(blocks);
    }
  }

  // Return the HTML with all placeholders and blocks replaced with their corresponding values
  return html.replace(placeholderRegex, (_, key) => data[key]);
}

module.exports = {
  render,
};
