module.exports = {
  plugins: {
    'tailwindcss': { config: './resources/config/tailwind.config.js' },
    'postcss-import': {},
    'postcss-preset-env': {
      browsers: 'last 2 versions',
      stage: 0,
    },
    'cssnano': {},
  },
}