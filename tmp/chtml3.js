function compile(templateString) {
  const BLOCK_START = "<!--{";
  const BLOCK_END = "}-->";
  const BLOCK_START_LENGTH = BLOCK_START.length;
  const BLOCK_END_LENGTH = BLOCK_END.length;

  function renderBlock(block, context) {
    const blockValue = context[block.name];
    if (typeof blockValue === "function") {
      return blockValue();
    } else if (Array.isArray(blockValue)) {
      let result = "";
      for (let i = 0; i < blockValue.length; i++) {
        const itemContext = Object.assign({}, context, { this: blockValue[i] });
        result += renderTemplate(block.template, itemContext);
      }
      return result;
    } else {
      return blockValue;
    }
  }

  function renderTemplate(template, context) {
    let result = "";
    let startIndex = 0;
    let endIndex = 0;
    let block = null;

    while ((startIndex = template.indexOf(BLOCK_START, endIndex)) !== -1) {
      result += template.substring(endIndex, startIndex);
      endIndex = template.indexOf(BLOCK_END, startIndex + BLOCK_START_LENGTH);

      if (endIndex === -1) {
        throw new Error(`Unclosed block "${template.substring(startIndex)}"`);
      }

      const blockContent = template.substring(
        startIndex + BLOCK_START_LENGTH,
        endIndex
      );
      const isClosingBlock = blockContent[0] === "/";

      if (isClosingBlock) {
        if (!block) {
          throw new Error(`Unopened block "${blockContent}"`);
        }

        if (block.name !== blockContent.substring(1)) {
          throw new Error(
            `Unclosed block "${BLOCK_START}${block.name}${BLOCK_END}", but closing "${BLOCK_START}${blockContent}${BLOCK_END}" found`
          );
        }

        result += renderBlock(block, context);
        block = null;
      } else {
        const blockName = blockContent.trim();
        block = {
          name: blockName,
          template: "",
        };
      }
    }

    result += template.substring(endIndex + BLOCK_END_LENGTH);

    if (block) {
      throw new Error(`Unclosed block "${BLOCK_START}${block.name}"`);
    }

    return result;
  }

  return (context) => renderTemplate(templateString, context);
}

module.exports = {
  compile,
};
