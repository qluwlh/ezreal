const path = require("path");
const { existsSync } = require("fs");

const DEFAULT_CONFIG_FILES = [
  "ezreal.config.ts",
  "ezreal.config.js",
  "config/config.ts",
  "config/config.js",
];

function getUserConfig() {
  const cwd = process.cwd();
  const configFile = DEFAULT_CONFIG_FILES.find((file) => {
    return existsSync(path.join(cwd, file));
  });
  return configFile ? require(path.join(cwd, configFile)) : {};
}

function mergeConfig(defaultConfig) {
  const config = getUserConfig();
  return {
    ...defaultConfig,
    resolve: {
      ...defaultConfig.resolve,
      alias: {
        ...defaultConfig.resolve.alias,
        ...config.alias,
      },
    },
  };
}
module.exports = {
  getUserConfig,
  mergeConfig,
};
