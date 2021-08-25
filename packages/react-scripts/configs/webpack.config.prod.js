const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { merge } = require("webpack-merge");
const TerserPlugin = require("terser-webpack-plugin");
const baseConfig = require("./webpack.config.base");
const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpackPaths = require("./webpack.paths.js");
module.exports = merge(baseConfig, {
  devtool: "source-map",
  bail: true,
  mode: "production",
  entry: [
    require.resolve("core-js"),
    require.resolve("regenerator-runtime/runtime"),
    webpackPaths.appIndexJs,
  ],
  output: {
    path: webpackPaths.appDist,
    filename: "static/js/[name].[contenthash:8].js",
  },
  module: {
    rules: [
      {
        // CSS/SCSS
        test: /\.s?css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "./",
            },
          },
          "css-loader",
          "sass-loader",
        ],
      },
    ],
  },

  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({ parallel: true }), new CssMinimizerPlugin()],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "production",
      DEBUG_PROD: false,
    }),

    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash:8].css",
      chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
    }),

    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === "true" ? "server" : "disabled",
      openAnalyzer: process.env.OPEN_ANALYZER === "true",
    }),
    new HtmlWebpackPlugin({
      filename: path.join("index.html"),
      template: path.join(webpackPaths.appPublic, "index.html"),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
      },
      isBrowser: false,
      env: process.env.NODE_ENV,
      isDevelopment: process.env.NODE_ENV !== "production",
    }),
  ],
});
