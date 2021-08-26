const webpack = require("webpack");
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.config.base");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpackPaths = require("./webpack.paths.js");
const InterpolateHtmlPlugin = require("react-dev-utils/InterpolateHtmlPlugin");
const { getClientEnvironment } = require("./env");
const env = getClientEnvironment(webpackPaths.publicUrlOrPath.slice(0, -1));
const { devServer } = require("./devServer");
module.exports = merge(baseConfig, {
  devtool: "cheap-module-source-map",
  mode: "development",
  output: {
    path: webpackPaths.appDist,
    filename: "static/js/bundle.js",
    chunkFilename: "static/js/[name].chunk.js",
    assetModuleFilename: "static/media/[name].[hash][ext]",
    publicPath: webpackPaths.publicUrlOrPath,
  },
  module: { rules: [] },
  plugins: [
    new ReactRefreshWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.EnvironmentPlugin({ NODE_ENV: "development" }),
    new webpack.LoaderOptionsPlugin({ debug: true }),
    new HtmlWebpackPlugin({
      template: path.join(webpackPaths.appPublic, "index.html"),
      inject: true,
    }),
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
  ],
  node: {
    __dirname: false,
    __filename: false,
  },
  devServer,
});
