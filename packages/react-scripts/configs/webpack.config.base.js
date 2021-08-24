const path = require("path");
const webpack = require("webpack");
const WebpackBar = require("webpackbar");

const webpackPaths = require("./webpack.paths.js");
const { dependencies: externals } = require("../package.json");
const envConfig = require("./env");
const ExternalTemplateRemotesPlugin = require("external-remotes-plugin");

const { NODE_ENV } = process.env;
module.exports = {
  target: "web",
  entry: path.resolve(webpackPaths.appSrc, "index"),
  output: {
    path: webpackPaths.appDist,
    publicPath: "/",
    filename: "static/js/[name].js",
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
          },
        },
      },
      // WOFF Font
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            mimetype: "application/font-woff",
          },
        },
      },
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            mimetype: "application/font-woff",
          },
        },
      },
      // OTF Font
      {
        test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            mimetype: "font/otf",
          },
        },
      },
      // TTF Font
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            mimetype: "application/octet-stream",
          },
        },
      },
      // EOT Font
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: "file-loader",
      },
      // SVG Font
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            mimetype: "image/svg+xml",
          },
        },
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: "url-loader",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
    alias: {
      "@": webpackPaths.appSrc,
    },
  },
  plugins: [
    new WebpackBar({ profile: true }),
    new webpack.DefinePlugin({
      GLOBAL_CONFIG: JSON.stringify(envConfig[NODE_ENV]),
      REACT_APP_ENV: JSON.stringify(NODE_ENV),
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: "production",
    }),
  ],
};
