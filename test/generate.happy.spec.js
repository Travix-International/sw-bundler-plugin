'use strict';

/* global describe,it,expect */

const proxyquire = require('proxyquire');
const FakeMultiEntryPlugin = require('./mocks/FakeMultiEntryPlugin');

describe('Successful case for SW generation', () => {
  const compiler = function compiler() {};

  const main = proxyquire('../generate.js', {
    './bundler': () => Promise.resolve({
      stats: {
        errors: [],
      },
      output: 'test.js',
    }),
    fs: {
      readdir: (path, cb) => cb(null, [
        'examples/test-1.js',
        'examples/test-2.js',
      ]),
      statSync: () => ({
        isFile: () => true,
      }),
      readFileSync: () => 'file content',
      writeFileSync: () => true,
    },
    'sw-precache': {
      generate: () => Promise.resolve('content'),
      write: (filepath, opts, cb) => cb(),
    },
    MultiEntryPlugin: FakeMultiEntryPlugin,
  });

  it('Generate sw-precache + custom SW', (done) => {
    const configuration = {
      assetsRootdir: 'examples',
      filename: `test-generator.${Date.now().toString(10)}.js`,
      swsDir: './examples/sws',
    };

    main(configuration, compiler)
      .then((r) => {
        expect(r.filename).to.equal('loader.js');
        expect(typeof r.file).to.equal('object');
        done();
      })
      .catch(done);
  });

  it('Generate only the sw-precache', (done) => {
    const configuration = {
      assetsRootdir: 'examples',
      filename: `test-generator.${Date.now().toString(10)}.js`,
    };

    main(configuration, compiler)
      .then((r) => {
        expect(r.filename).to.equal('loader.js');
        expect(typeof r.file).to.equal('object');
        done();
      })
      .catch(done);
  });
});
