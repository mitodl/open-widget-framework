var path = require('path')
var BundleTracker = require('webpack-bundle-tracker')

module.exports = function ({command}) {
  let config = {type: 'react-app'}

  // Only include react-hot-loader config when serving a development build
  if (command.startsWith('serve')) {
    config.babel = {plugins: 'react-hot-loader/babel'}
    config.webpack = {
      config(webpackConfig) {
        // React Hot Loader's patch module needs to run before your app
        webpackConfig.entry.unshift('react-hot-loader/patch')
        return webpackConfig
      },
      extra: {
        output: {path: path.resolve('./dist/webpack_bundles/')},
        plugins: [
          new BundleTracker({filename: './webpack-stats.json'}),
        ],
      },
      publicPath: 'http://localhost:3000/',
    }
  }
  return config
}
