const path = require("path");
const webpack = require("webpack");
const WebpackBar = require("webpackbar");
const ESLintPlugin = require("eslint-webpack-plugin");

const webpackPaths = require("./webpack.paths.js");
const envConfig = require("./env");
const { NODE_ENV } = process.env;
const isEnvDevelopment = NODE_ENV === "development";
const utils = require("../utils");

const fontRules = [
  // WOFF Font
  {
    test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
    use: {
      loader: require.resolve("url-loader"),
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
      loader: require.resolve("url-loader"),
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
      loader: require.resolve("url-loader"),
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
      loader: require.resolve("url-loader"),
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
      loader: require.resolve("url-loader"),
      options: {
        limit: 10000,
        mimetype: "image/svg+xml",
      },
    },
  },
];

module.exports = {
  target: "web",
  module: {
    rules: [
      ...fontRules,
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: require.resolve("url-loader"),
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
    modules: ["node_modules", webpackPaths.appNodeModules],
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
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
    new ESLintPlugin({
      extensions: ["js", "mjs", "jsx", "ts", "tsx"],
      formatter: require.resolve("react-dev-utils/eslintFormatter"),
      eslintPath: require.resolve("eslint"),
      failOnError: !isEnvDevelopment,
      context: webpackPaths.appSrc,
      cache: true,
      cacheLocation: path.resolve(
        webpackPaths.appNodeModules,
        ".cache/.eslintcache"
      ),
      cwd: webpackPaths.appPath,
      resolvePluginsRelativeTo: __dirname,
      baseConfig: {
        extends: [require.resolve("@wanglihua/eslint-config-react-app/base")],
        rules: {
          ...(!utils.hasJsxRuntime && {
            "react/react-in-jsx-scope": "error",
          }),
        },
      },
    }),
  ],
};
