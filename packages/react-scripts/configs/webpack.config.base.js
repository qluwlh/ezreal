const path = require('path')
const webpack = require('webpack')
const WebpackBar = require('webpackbar')
const ESLintPlugin = require('eslint-webpack-plugin')
const webpackPaths = require('./webpack.paths.js')
const ExternalTemplateRemotesPlugin = require('external-remotes-plugin')
const { getFontLoaders } = require('./font')
const { getFileLoaders: getImageLoaders } = require('./file')
const { getStyleLoaders } = require('./style')
const { getBabelLoaders } = require('./babel')

module.exports = {
  target: 'web',
  entry: [
    require.resolve('core-js/stable'),
    require.resolve('regenerator-runtime/runtime'),
    webpackPaths.appIndexJs,
  ],
  module: {
    rules: [...getBabelLoaders(), ...getStyleLoaders(), ...getFontLoaders(), ...getImageLoaders()],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: ['node_modules', webpackPaths.appNodeModules],
    alias: {
      '@': webpackPaths.appSrc,
    },
  },
  plugins: [
    new ExternalTemplateRemotesPlugin(),
    new WebpackBar({ profile: true }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
    new ESLintPlugin({
      context: webpackPaths.appPath,
      files: ['*/**/*.{ts,tsx,js,jsx}'],
      cache: true,
      cacheLocation: path.resolve(webpackPaths.appNodeModules, '.cache/.eslintcache'),
      threads: true,
      lintDirtyModulesOnly: false,
    }),
  ],
}
