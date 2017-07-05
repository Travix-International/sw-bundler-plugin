'use strict';

const generate = require('./index').generate;

generate({
  assetsRootdir: 'examples',
  filename: `test-generator.${Date.now().toString(10)}.js`,
  swsDir: './examples/sws',
})
.then(r => console.log(`Successful: ${r}`))
.catch(console.error);
