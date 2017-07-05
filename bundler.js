'use strict';

/**
 * Trigger a child process for compiling the service-workers
 * @param {Array.<string>} entries The files to compile 
 * @param {Object} opts The options for webpack
 * @param {Compiler} compiler The child compiler to use for generating the bundle
 * 
 * @return {Promise.<Object, Error>} If the compilation succeed in return the stats of the build and the name of the file which was bundled. If it fails reject an error.
 */
function bundleScripts(entries, opts, compiler) {
  return new Promise((resolve, reject) => {
    compiler.runAsChild((err, e, compilation) => {
      if (err) reject(err);

      resolve({
        stats: compilation,
        output: opts.output.filename
      });
    });
  });
}

module.exports = bundleScripts;
