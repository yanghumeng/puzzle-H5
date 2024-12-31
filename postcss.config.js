module.exports = {
  plugins: {
    "postcss-px-to-viewport": {
      viewportWidth: 375,
      unitPrecision: 3,
      viewportUnit: "vw",
      selectorBlackList: [".ignore"],
      minPixelValue: 1,
      mediaQuery: false,
      exclude: [/node_modules/],
    },
  },
};
