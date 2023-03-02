function render(template, data) {
  // Regular expression to match block tags
  const regex = /<!--\{(\/?)([\w.]+)\}-->/g;

  // Replace each block tag with its value
  return template.replace(regex, (match, slash, blockName) => {
      // Get the block value from the data object
      const blockValue = blockName.split('.').reduce((obj, property) => obj[property], data);

      // If it's a closing tag, return an empty string
      if (slash) {
          return '';
      }
      // If the block value is a function, call it and return its value
      else if (typeof blockValue === 'function') {
          return blockValue() || '';
      }
      // If the block value is an array, render each item in the array
      else if (Array.isArray(blockValue)) {
          return blockValue.map(item => render(match.replace(blockName, 'this'), {this: item})).join('');
      }
      // If the block value is truthy, render the nested template
      else if (blockValue) {
          const nestedTemplate = match.slice(match.indexOf('>') + 1, match.lastIndexOf('<'));
          return render(nestedTemplate, data);
      }
      // Otherwise, return an empty string
      else {
          return '';
      }
  });
}
