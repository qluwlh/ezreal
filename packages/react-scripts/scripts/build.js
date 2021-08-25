"use strict";

process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";

process.on("unhandledRejection", (err) => {
  throw err;
});

const chalk = require("react-dev-utils/chalk");
const fs = require("fs-extra");
const webpack = require("webpack");
const webpackPaths = require("../configs/webpack.paths.js");
const config = require("../configs/webpack.config.prod");
const { checkBrowsers } = require("react-dev-utils/browsersHelper");
const FileSizeReporter = require("react-dev-utils/FileSizeReporter");

const measureFileSizesBeforeBuild =
  FileSizeReporter.measureFileSizesBeforeBuild;

const isInteractive = process.stdout.isTTY;

checkBrowsers(webpackPaths.appRoot, isInteractive)
  .then(() => {
    return measureFileSizesBeforeBuild(webpackPaths.appDist);
  })
  .then((previousFileSizes) => {
    fs.emptyDirSync(webpackPaths.appDist);
    copyPublicFolder();
    return build(previousFileSizes);
  })
  .then((res) => {
    console.log(`🚀 build success`);
  })
  .catch((err) => {
    console.log(chalk.red("Failed to compile.\n"), err);
    process.exit(1);
  });

function build(previousFileSizes) {
  console.log("Creating an optimized production build...");
  const compiler = webpack(config);
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      } else {
        console.log(`stats`, stats);
        return resolve(stats);
      }
    });
  });
}

function copyPublicFolder() {
  fs.copySync(webpackPaths.appPublic, webpackPaths.appDist, {
    dereference: true,
    filter: (file) => file !== webpackPaths.appHtml,
  });
}
