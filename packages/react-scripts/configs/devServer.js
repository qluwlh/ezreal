const webpackPaths = require("./webpack.paths.js");

const devServer = {
  contentBase: [webpackPaths.appDist, webpackPaths.appPublic],
  //   publicPath: webpackPaths.publicUrlOrPath,
  open: true,
  compress: true,
  hot: true,
  inline: true,
  noInfo: false,
  lazy: false,
  stats: "errors-warnings",
  headers: { "Access-Control-Allow-Origin": "*" },
  watchOptions: {
    aggregateTimeout: 300,
    ignored: /node_modules/,
    poll: 100,
  },
  historyApiFallback: {
    verbose: true,
    disableDotRule: false,
  },
};

module.exports = { devServer };
