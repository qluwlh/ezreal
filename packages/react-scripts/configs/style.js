const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpackPaths = require("./webpack.paths.js");

const getCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent");

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;

const isEnvDevelopment = process.env.NODE_ENV === "development";

const getLoaders = (cssOptions, preProcessor) => {
  const loaders = [
    isEnvDevelopment && require.resolve("style-loader"),
    !isEnvDevelopment && {
      loader: MiniCssExtractPlugin.loader,
      options: webpackPaths.publicUrlOrPath.startsWith(".")
        ? { publicPath: "../../" }
        : {},
    },
    {
      loader: require.resolve("css-loader"),
      options: cssOptions,
    },
    {
      loader: require.resolve("postcss-loader"),
      options: {
        postcssOptions: {
          ident: "postcss",
          plugins: [
            "postcss-flexbugs-fixes",
            [
              "postcss-preset-env",
              {
                autoprefixer: {
                  flexbox: "no-2009",
                },
                stage: 3,
              },
            ],
            "postcss-normalize",
          ],
        },
        sourceMap: isEnvDevelopment,
      },
    },
  ].filter(Boolean);
  if (preProcessor) {
    loaders.push(
      {
        loader: require.resolve("resolve-url-loader"),
        options: {
          sourceMap: isEnvDevelopment,
          root: webpackPaths.appSrc,
        },
      },
      {
        loader: require.resolve(preProcessor),
        options: {
          sourceMap: true,
        },
      }
    );
  }
  return loaders;
};

const getStyleLoaders = () => {
  return [
    {
      test: cssRegex,
      exclude: cssModuleRegex,
      use: getLoaders({
        importLoaders: 1,
        sourceMap: true,
        modules: { mode: "icss" },
      }),
      sideEffects: true,
    },
    {
      test: cssModuleRegex,
      use: getLoaders({
        importLoaders: 1,
        sourceMap: true,
        modules: {
          mode: "local",
          getLocalIdent: getCSSModuleLocalIdent,
        },
      }),
    },
    {
      test: sassRegex,
      exclude: sassModuleRegex,
      use: getLoaders(
        {
          importLoaders: 3,
          sourceMap: true,
          modules: {
            mode: "icss",
          },
        },
        "sass-loader"
      ),
      sideEffects: true,
    },
    {
      test: sassModuleRegex,
      use: getLoaders(
        {
          importLoaders: 3,
          sourceMap: isEnvDevelopment,
          modules: {
            mode: "local",
            getLocalIdent: getCSSModuleLocalIdent,
          },
        },
        "sass-loader"
      ),
    },
    {
      test: lessRegex,
      exclude: lessModuleRegex,
      use: getLoaders(
        {
          importLoaders: 3,
          sourceMap: true,
          modules: { mode: "icss" },
        },
        "less-loader"
      ),
      sideEffects: true,
    },
    {
      test: lessModuleRegex,
      use: getLoaders(
        {
          importLoaders: 3,
          sourceMap: isEnvDevelopment,
          modules: {
            mode: "local",
            getLocalIdent: getCSSModuleLocalIdent,
          },
        },
        "less-loader"
      ),
    },
  ];
};

module.exports = {
  getStyleLoaders,
};
