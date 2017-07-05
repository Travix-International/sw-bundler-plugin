'use strict';

/* global describe,it,expect */

const proxyquire = require('proxyquire');
const FakeMultiEntryPlugin = require('./mocks/FakeMultiEntryPlugin');

describe('Fail case for SW generation', () => {
  const configuration = {
    assetsRootdir: 'examples',
    filename: `test-generator.${Date.now().toString(10)}.js`,
    swsDir: './examples/sws',
  };

  it('reject with an error if sw-precache fails (generate)', (done) => {
    const generate = proxyquire('../generate.js', {
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
        generate: () => Promise.reject(new Error('no')),
        write: (filepath, opts, cb) => cb(),
      },
      MultiEntryPlugin: FakeMultiEntryPlugin,
    });

    generate(configuration)
      .then(() => {
        done(new Error('The test must fail'));
      })
      .catch((err) => {
        expect(err.message).to.equal('no');
        done();
      });
  });

  it('reject with an error if sw-precache fails (write)', (done) => {
    const generate = proxyquire('../generate.js', {
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
        write: (filepath, opts, cb) => cb(new Error('no')),
      },
      MultiEntryPlugin: FakeMultiEntryPlugin,
    });

    generate({
      assetsRootdir: 'examples',
      filename: `test-generator.${Date.now().toString(10)}.js`,
    })
      .then(() => {
        done(new Error('The test must fail'));
      })
      .catch((err) => {
        expect(err.message).to.equal('no');
        done();
      });
  });

  it('reject with an error if readdir fails', (done) => {
    const generate = proxyquire('../generate.js', {
      fs: {
        readdir: (path, cb) => cb(new Error('no'), [
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

    generate(configuration)
      .then(() => {
        done(new Error('The test must fail'));
      })
      .catch((err) => {
        expect(err.message.endsWith('no.')).to.equal(true);
        done();
      });
  });
});
