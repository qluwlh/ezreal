const { hasJsxRuntime } = require("../utils");

const isEnvDevelopment = process.env.NODE_ENV === "development";

const test = /\.[jt]sx?$/;
const exclude = /node_modules/;
const loader = require.resolve("babel-loader");
const presets = [
  [
    require.resolve("@wanglihua/babel-preset-react-app"),
    { runtime: hasJsxRuntime ? "automatic" : "classic" },
  ],
];

const devLoaders = [
  {
    test,
    exclude,
    loader,
    options: {
      presets,
      plugins: [require.resolve("react-refresh/babel")].filter(Boolean),
    },
  },
];

const prodLoaders = [
  {
    test,
    exclude,
    loader,
    options: {
      presets,
      cacheDirectory: true,
    },
  },
];

const getBabelLoaders = () => {
  return isEnvDevelopment ? devLoaders : prodLoaders;
};

module.exports = {
  getBabelLoaders,
};
