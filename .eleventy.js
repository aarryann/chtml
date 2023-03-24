module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('img');
  eleventyConfig.addPassthroughCopy('css');
  eleventyConfig.addPassthroughCopy('js');
  return {
      passthroughFileCopy: true,
      dir: {
        input: "./",      // Equivalent to Jekyll's source property
        output: "./_site" // Equivalent to Jekyll's destination property
      }      
  };
};