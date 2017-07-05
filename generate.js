'use strict';

const fs = require('fs');
const path = require('path');

const swPrecache = require('sw-precache');

const MultiEntryPlugin = require('webpack/lib/MultiEntryPlugin');

const bundler = require('./bundler');

/**
 * generateTemplate create the loader for the frontend.
 * @private
 * @param {Function} resolve The `resolve` function from the Promise
 * @param {String} swFile The filename to load on the client
 */
function generateTemplate(resolve, swFile) {
  // update template
  const loader = fs.readFileSync(path.join(process.cwd(), 'loader.tpl.js')).toString();
  const src = loader.replace('{{ swFile }}', swFile);

  resolve({
    filename: 'loader.js',
    file: {
      source: () => src,
      size: () => src.length,
    },
  });
}

/**
 * Default function.
 * Generates a file with the SW pre-cache logic + the custom SW scripts bundled using Webpack
 * @param {Object} options The options for building the SW script
 * @param {Compiler} compiler The child compiler to use for bundling
 * 
 * @return {Promise.<Object, Error>} If success resolves an Object describing the file for the loader to add to the cache. If fail, rejects with an Error.
 * 
 * @example
 *  Configuration example:
 *   {
 *     assetsRootdir: 'my/assets',
 *     outputPath: 'my/path', // default current cwd
 *     filename: 'sw.js', // specify the filename. Default 'sw.timestamp.js',
 *     swsDir: 'my/service/workers', // path to the directory where to find the SW scripts
 *     webpackOpts: { // extra webpack configuration
 *       test: /\.jsx?$/
 *     },
 *     swprecacheOpts: {} // extra sw-precache configuration
 *   } 
 */
function generate(options, compiler) {
  return new Promise((resolve, reject) => {
    if (options.swsDir) {
      // build the custom scripts including the sw-precache scripts
      const initPromise = swPrecache.generate(Object.assign({
        staticFileGlobs: [`${options.assetsRootdir}/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}`],
        stripPrefix: options.assetsRootdir,
      }, options.swprecacheOpts));

      initPromise.then((content) => {
        const entries = [];
        // read the dir - create the entry array
        fs.readdir(options.swsDir, (err, files) => {
          if (err) {
            const e = new Error(`An error occured when trying to read the files from the directory ${options.swDir}. Details: ${err.message}.`);
            reject(e);
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
          const precacheFile = path.resolve(path.join(process.cwd(), '.tmp', `sw.precache.js`));
          fs.writeFileSync(precacheFile, content, { encoding: 'utf8' });

          compiler.apply(new MultiEntryPlugin(
            compiler.context,
            entries,
            options.filename
          ));

          bundler(entries, Object.assign({
            output: {
              filename: options.filename,
              path: path.join(process.cwd(), 'build'),
            },
          }, options.webpack), compiler).then((data) => {
            if (Array.isArray(data.stats.errors) && data.stats.errors.length) {
              reject(new Error(`Some error(s) occured: ${data.stats.errors.join(', ')}`));
            }

            generateTemplate(resolve, data.output);
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
        return generateTemplate(resolve, options.filename);
      });
    }
  });
}

module.exports = generate;
