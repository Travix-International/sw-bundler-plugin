'use strict';

const generate = require('./generate');

/**
 * The Webpack plugin bundling the service-workers
 * @class SWBundler
 * @example
 * A webpack config using the plugin:
 * 
 * {
 *   entry: './examples/assets/js/index.js',
 *   output: {
 *     path: path.join(process.cwd(), 'build'),
 *     filename: 'output.js',
 *   },
 *   module: {
 *     rules: [{
 *       test: /\.jsx?$/,
 *     }],
 *   },
 *   devServer: {
 *     contentBase: path.join(__dirname, 'examples'),
 *     port: 9000,
 *   },
 *   plugins: [
 *     new SWBundler({
 *       assetsRootdir: 'examples',
 *       filename: `test-generator.${Date.now().toString(10)}.js`,
 *       swsDir: './examples/sws',
 *     }),
 *   ],
 * };
 */
module.exports = class SWBUndlerPlugin {
  constructor(opts) {
    this.options = Object.assign({
      outputPath: process.cwd(),
      filename: `sw.${Date.now().toString(10)}.js`,
    }, opts);
  }

  apply(compiler) {
    const opts = this.options;

    compiler.plugin('make', function make(compilation, callback) {
      const childCompiler = compilation.createChildCompiler('sw-bundler', {
        filename: opts.filename,
      });

      childCompiler.context = compiler.context;

      generate(opts, childCompiler, compilation)
        .then((res) => {
          compilation.assets[res.filename] = res.file;
          callback();
        })
        .catch(callback);
    });
  }
};
