'use strict';

const path = require('path');
const SWBUndlerPlugin = require('./index');

module.exports = {
  entry: './examples/assets/js/index.js',
  output: {
    path: path.join(process.cwd(), 'build'),
    filename: 'output.js',
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
    }],
  },
  devServer: {
    contentBase: path.join(__dirname, 'examples'),
    port: 9000,
  },
  plugins: [
    new SWBUndlerPlugin({
      assetsRootdir: 'examples',
      filename: `test-generator.${Date.now().toString(10)}.js`,
      swsDir: './examples/sws',
    }),
  ],
};
