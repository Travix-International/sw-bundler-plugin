# sw-bundler-plugin

[![npm](https://img.shields.io/npm/v/sw-bundler-plugin.svg)](https://www.npmjs.com/package/sw-bundler-plugin)  [![Build Status](https://travis-ci.org/Travix-International/sw-bundler-plugin.svg?branch=master)](https://travis-ci.org/Travix-International/sw-bundler-plugin)

*yet another Webpack plugin for the Service-Workers*

A service-workers bundler for Webpack.

## What is it?

This plugin is using the Google Chrome module [sw-precache](https://www.npmjs.com/package/sw-precache). It generates your pre-cache SW script.
If you have some custom service-worker usage (asynchronous storage strategy for your frontend, notifications ...) the plugin bundles all your scripts in one single file.

Why?

Because you can execute only one service-worker on your website.

## How does it work?

Go to your project. Run the following command:

```bash
npm i --save-dev sw-bundler
```

Open your Webpack config and add the following configuration:

```javascript
module.exports = {
  // ... your config
  plugins: [
    new SWBundlerPlugin({
      assetsRootdir: 'examples',
      filename: `test-generator.${Date.now().toString(10)}.js`,
      swsDir: './examples/sws',
    }),
  ],
}
```

The `swsDir` is the directory where your SW scripts are. The plugin will list all the files in this directory and bundle them with the output of the sw-precache module.

## How to test it?

Clone the project and run `npm run test`. The unit-tests try to be as close as possible to the real use-case you could have.
If you want a *real life* demo run the following commands after cloning the repository:

```bash
$> npm i
$> $(npm bin)/webpack
$> npm run start
```

It will open a new tab in your browser. Checkout the console (the application tab) and enjoy !

## Documentation

### Configuration

The plugin accepts an object as configuration. Here are some of the properties you could set:

  * `assetsRootdir`: the directory with your assets (default : `process.cwd()`)
  * `filename`: the name of the file to output (default: `sw.timestamp.js` where timestamp is equal to `Date.now()`).
    If you plan to use a custom filename, do not forget to integrate a value for invalidating the old version of your file.
  * `swsDir`: The directory where your custom Service Worker scripts are stored
  * `webpackOpts`: Some extra configuration for Webpack (e.g.: Babel, minification ...)
  * `swprecacheOpts`: some extra options for the `sw-precache` module (see this [page](https://www.npmjs.com/package/sw-precache#options-parameter) for more information)

## Contributing - Complaining

If you found a bug or think that something is missing, do not hesitate to open a issue or a pull-request
