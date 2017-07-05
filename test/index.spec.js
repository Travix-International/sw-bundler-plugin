'use strict';

const proxyquire = require('proxyquire');

describe('Successful case for SW generation', () => {
  const main = proxyquire('../index.js', {
    fs: {
      readdir: (path, cb) => cb(null, [
        'examples/test-1.js',
        'examples/test-2.js',
      ]),
      statSync: (filePath) => ({
        isFile: () => true,
      }),
      readFileSync: (filePath) => 'file content',
      writeFileSync: (filePath, content, opts) => true,
    },
    'sw-precache': {
      generate: () => Promise.resolve('content'),
      write: (filepath, opts, cb) => cb(),
    },
    webpack: () => ({
      run: (cb) => cb(null, {
        stats: {
          errors: []
        },
        output: './test.js',
      })
    }),
  });

  it('Generate sw-precache + custom SW', (done) => {
    const configuration = {
      assetsRootdir: 'examples',
      filename: `test-generator.${Date.now().toString(10)}.js`,
      swsDir: './examples/sws',
    };

    main.generate(configuration)
      .then((r) => {
        expect(r).to.equal(1);
        done();
      })
      .catch(done);
  });

  it('Generate only the sw-precache', (done) => {
    const configuration = {
      assetsRootdir: 'examples',
      filename: `test-generator.${Date.now().toString(10)}.js`,
    };

    main.generate(configuration)
      .then((r) => {
        expect(r).to.equal(1);
        done();
      })
      .catch(done);
  });
});

describe('Fail case for SW generation', () => {
  const configuration = {
    assetsRootdir: 'examples',
    filename: `test-generator.${Date.now().toString(10)}.js`,
    swsDir: './examples/sws',
  };

  it('reject with an error if sw-precache fails (generate)', (done) => {
    const main = proxyquire('../index.js', {
      fs: {
        readdir: (path, cb) => cb(null, [
          'examples/test-1.js',
          'examples/test-2.js',
        ]),
        statSync: (filePath) => ({
          isFile: () => true,
        }),
        readFileSync: (filePath) => 'file content',
        writeFileSync: (filePath, content, opts) => true,
      },
      'sw-precache': {
        generate: () => Promise.reject(new Error('no')),
        write: (filepath, opts, cb) => cb(),
      },
      webpack: () => ({
        run: (cb) => cb(null, {
          stats: {
            errors: []
          },
          output: './test.js',
        })
      }),
    });

    main.generate(configuration)
      .then((r) => {
        done(new Error('The test must fail'));
      })
      .catch((err) => {
        expect(err.message).to.equal('no');
        done();
      });
  });

  it('reject with an error if sw-precache fails (write)', (done) => {
    const main = proxyquire('../index.js', {
      fs: {
        readdir: (path, cb) => cb(null, [
          'examples/test-1.js',
          'examples/test-2.js',
        ]),
        statSync: (filePath) => ({
          isFile: () => true,
        }),
        readFileSync: (filePath) => 'file content',
        writeFileSync: (filePath, content, opts) => true,
      },
      'sw-precache': {
        generate: () => Promise.resolve('content'),
        write: (filepath, opts, cb) => cb(new Error('no')),
      },
      webpack: () => ({
        run: (cb) => cb(null, {
          stats: {
            errors: []
          },
          output: './test.js',
        })
      }),
    });

    main.generate({
      assetsRootdir: 'examples',
      filename: `test-generator.${Date.now().toString(10)}.js`,
    })
      .then((r) => {
        done(new Error('The test must fail'));
      })
      .catch((err) => {
        expect(err.message).to.equal('no');
        done();
      });
  });

  it('reject with an error if readdir fails', (done) => {
    const main = proxyquire('../index.js', {
      fs: {
        readdir: (path, cb) => cb(new Error('no'), [
          'examples/test-1.js',
          'examples/test-2.js',
        ]),
        statSync: (filePath) => ({
          isFile: () => true,
        }),
        readFileSync: (filePath) => 'file content',
        writeFileSync: (filePath, content, opts) => true,
      },
      'sw-precache': {
        generate: () => Promise.resolve('content'),
        write: (filepath, opts, cb) => cb(),
      },
      webpack: () => ({
        run: (cb) => cb(null, {
          stats: {
            errors: []
          },
          output: './test.js',
        })
      }),
    });

    main.generate(configuration)
      .then((r) => {
        done(new Error('The test must fail'));
      })
      .catch((err) => {
        expect(err.message).to.equal('no');
        done();
      });
  });

  it('reject if an error happened while bundling', (done) => {
    const main = proxyquire('../index.js', {
      fs: {
        readdir: (path, cb) => cb(null, [
          'examples/test-1.js',
          'examples/test-2.js',
        ]),
        statSync: (filePath) => ({
          isFile: () => true,
        }),
        readFileSync: (filePath) => 'file content',
        writeFileSync: (filePath, content, opts) => true,
      },
      'sw-precache': {
        generate: () => Promise.resolve('content'),
        write: (filepath, opts, cb) => cb(),
      },
      webpack: () => ({
        run: (cb) => cb(new Error('no'), {
          stats: {
            errors: []
          },
          output: './test.js',
        })
      }),
    });

    main.generate(configuration)
      .then((r) => {
        done(new Error('The test must fail'));
      })
      .catch((err) => {
        expect(err.message).to.equal('no');
        done();
      });
  });
});