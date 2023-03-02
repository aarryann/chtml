function render(template, data) {
  const re = /<!--\{(.*?)\}-->/g;

  let match;
  let rendered = template;

  while ((match = re.exec(template))) {
    const [placeholder, block] = match;
    const [fullMatch, blockType, blockValue] = block.match(/#(\w+)\s?(.*)?/);

    switch (blockType) {
      case 'if': {
        const condition = data[blockValue.trim()];

        if (!condition) {
          rendered = rendered.replace(placeholder, '');
        }

        break;
      }

      case 'each': {
        const [array, content] = blockValue.split('=>').map(item => item.trim());

        if (Array.isArray(data[array])) {
          const arrayRendered = data[array].map(item => {
            let renderedContent = content;

            for (const [key, value] of Object.entries(item)) {
              renderedContent = renderedContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
            }

            return renderedContent;
          }).join('');

          rendered = rendered.replace(placeholder, arrayRendered);
        } else {
          rendered = rendered.replace(placeholder, '');
        }

        break;
      }

      default: {
        if (data[blockValue.trim()]) {
          rendered = rendered.replace(placeholder, data[blockValue.trim()]);
        } else {
          rendered = rendered.replace(placeholder, '');
        }

        break;
      }
    }
  }

  return rendered;
}

function render1(template, data) {
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

function render2(content, options) {
  let output = content;
  const regex = /<!--\s*IF\s+([\w.]+)\s*-->([\s\S]*?)<!--\s*ENDIF\s*-->/g;

  output = output.replace(regex, (match, property, block) => {
  const value = getProperty(options, property);
  if (value) {
    return block.trim();
  } else {
    return '';
  }
  });

  const blockRegex = /<!--\s*(\w+)\s*-->([\s\S]*?)<!--\s*END\s+\1\s*-->/g;

  output = output.replace(blockRegex, (match, name, block) => {
  const value = getProperty(options, name);
  if (typeof value === 'function') {
    return value();
  } else if (value) {
    return block.trim();
  } else {
    return '';
  }
  });

  return output;
}

function getProperty(obj, path) {
  const keys = path.split('.');
  let value = obj;
  for (let key of keys) {
  value = value[key];
  if (value === undefined) {
    return undefined;
  }
  }
  return value;
}

module.exports = {
  render, render1, render2
};

