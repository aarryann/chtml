module.exports = {
  plugins: {
    'tailwindcss': { config: './res/webpack/tailwind.config.js' },
    'postcss-import': {},
    'postcss-preset-env': {
      browsers: 'last 2 versions',
      stage: 0,
    },
    'cssnano': {},
  },
}