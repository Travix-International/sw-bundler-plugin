'use strict';

const fs = require('fs');
const path = require('path');

const swPrecache = require('sw-precache');
const webpack = require('webpack');

function bundleScripts(entries, opts) {
  return new Promise((resolve, reject) => {
    // build with the functionalities
    const config = Object.assign({
      entry: entries,
      module: {
        rules: [{
          test: /\.jsx?$/,
          include: ['*.html', 'assets/*'],
        }],
      },
      resolve: {
        modules: [
          "node_modules",
        ],
        extensions: [".js", ".jsx"],
      },
    }, opts);

    const compiler = webpack(config);

    compiler.run((err, stats) => {
      if (err) reject(err);

      resolve({
        stats,
        output: config.output.filename
      });
    });
  });
}

/**
 * Default function.
 * Generates a file with the SW pre-cache logic + the custom SW scripts bundled using Webpack
 * @param {Object} opts The options for building the SW script
 * 
 * @example
 *  Configuration example:
 *    {
 *      assetsRootdir: 'my/assets',
 *      outputPath: 'my/path', // default current cwd
 *      filename: 'sw.js', // specify the filename. Default 'sw.timestamp.js',
 *      swsDir: 'my/service/workers', // path to the directory where to find the SW scripts
 *      webpackOpts: { // extra webpack configuration
 *        test: /\.jsx?$/
 *      },
 *      swprecacheOpts: {} // extra sw-precache configuration
 *    } 
 */
function generate(opts) {
  return new Promise((resolve, reject) => {

    const options = Object.assign({
      outputPath: process.cwd(),
      filename: `sw.${Date.now().toString(10)}.js`,
    }, opts);

    if (options.swsDir) {
      // build the custom scripts including the sw-precache scripts
      const initPromise = swPrecache.generate(Object.assign({
        staticFileGlobs: [`${options.assetsRootdir}/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}`],
        stripPrefix: options.assetsRootdir,
      }, options.swprecacheOpts));

      initPromise.then((content) => {
        const swScript = content;

        const entries = [];
        // read the dir - create the entry array
        fs.readdir(options.swsDir, (err, files) => {
          if (err) {
            console.error(`An error occured when trying to read the files from the directory ${options.swDir}. Details: ${err.message}`);
            reject(err);
          }

          files.forEach((file) => {
            const filePath = path.resolve(path.join(process.cwd(), options.swsDir, file));
            const stat = fs.statSync(filePath);

            // for now manage only one level of depth
            if (stat.isFile()) {
              entries.push(filePath);
            }
          });

          // create file for sw-precache
          const precacheFile = path.resolve(path.join(process.cwd(), options.swsDir, `sw.precache.js`));
          fs.writeFileSync(precacheFile, content, { encoding: 'utf8' });

          bundleScripts(entries, Object.assign({
            output: {
              filename: options.filename,
              path: path.join(process.cwd(), 'build'),
            },
          }, opts.webpack)).then((data) => {
            if (Array.isArray(data.stats.errors) && data.stats.errors.length) {
              reject(new Error(`Some error(s) occured: ${data.stats.errors.join(', ')}`));
            }
            // update template
            const loader = fs.readFileSync(path.join(process.cwd(), 'loader.tpl.js')).toString();
            fs.writeFileSync(
              path.join(process.cwd(), 'build', 'loader.js'),
              loader.replace('{{ swFile }}', data.output),
              { encoding: 'utf8', flag: 'w+' }
            );
            resolve(1);
          }).catch(reject);
        });
      }).catch(reject);
    } else {
      // only call sw-precache and generate the SW
      swPrecache.write(path.join(process.cwd(), 'build', options.filename), Object.assign({
        staticFileGlobs: [`${options.assetsRootdir}/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}`],
        stripPrefix: options.assetsRootdir,
      }, options.swprecacheOpts), (err) => {
        if (err) return reject(err);
        return resolve(1);
      });
    }
  });
}

module.exports = {
  generate,
  bundleScripts,
};
