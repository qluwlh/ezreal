"use strict";

const chalk = require("react-dev-utils/chalk");
const fs = require("fs");
const resolve = require("resolve");
const path = require("path");
const paths = require("../../configs/webpack.paths");
const os = require("os");
const semver = require("semver");
const immer = require("react-dev-utils/immer").produce;
const resolveOwn = (relativePath) =>
  path.resolve(__dirname, "..", relativePath);

const hasJsxRuntime = (() => {
  if (process.env.DISABLE_NEW_JSX_TRANSFORM === "true") {
    return false;
  }

  try {
    require.resolve("react/jsx-runtime", { paths: [paths.appRoot] });
    return true;
  } catch (e) {
    return false;
  }
})();

function writeJson(fileName, object) {
  fs.writeFileSync(
    fileName,
    JSON.stringify(object, null, 2).replace(/\n/g, os.EOL) + os.EOL
  );
}

function verifyTypeScriptSetup() {
  let firstTimeSetup = false;

  if (!fs.existsSync(paths.appTsConfig)) {
    writeJson(paths.appTsConfig, {});
    firstTimeSetup = true;
  }

  const isYarn = fs.existsSync(paths.yarnLockFile);

  let ts;
  try {
    console.log(`paths.appNodeModules`, paths.appNodeModules);
    ts = require(resolve.sync("typescript", {
      basedir: paths.appNodeModules,
    }));
  } catch (_) {
    console.error(
      chalk.bold.red(`Do not have ${chalk.bold("typescript")} installed.`)
    );
    console.error(
      chalk.bold(
        "Please install",
        chalk.cyan.bold("typescript"),
        "by running",
        chalk.cyan.bold(
          isYarn ? "yarn add typescript" : "npm install typescript"
        ) + "."
      )
    );
    process.exit(1);
  }

  const compilerOptions = {
    target: {
      parsedValue: ts.ScriptTarget.ES5,
      suggested: "es5",
    },
    lib: { suggested: ["dom", "dom.iterable", "esnext"] },
    allowJs: { suggested: true },
    skipLibCheck: { suggested: true },
    esModuleInterop: { suggested: true },
    allowSyntheticDefaultImports: { suggested: true },
    strict: { suggested: true },
    forceConsistentCasingInFileNames: { suggested: true },
    noFallthroughCasesInSwitch: { suggested: true },

    module: {
      parsedValue: ts.ModuleKind.ESNext,
      value: "esnext",
      reason: "for import() and import/export",
    },
    moduleResolution: {
      parsedValue: ts.ModuleResolutionKind.NodeJs,
      value: "node",
      reason: "to match webpack resolution",
    },
    resolveJsonModule: { value: true, reason: "to match webpack loader" },
    isolatedModules: { value: true, reason: "implementation limitation" },
    noEmit: { value: true },
    jsx: {
      parsedValue:
        hasJsxRuntime && semver.gte(ts.version, "4.1.0-beta")
          ? ts.JsxEmit.ReactJSX
          : ts.JsxEmit.React,
      value:
        hasJsxRuntime && semver.gte(ts.version, "4.1.0-beta")
          ? "react-jsx"
          : "react",
      reason: "to support the new JSX transform in React 17",
    },
    paths: { value: undefined, reason: "aliased imports are not supported" },
  };

  const formatDiagnosticHost = {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => os.EOL,
  };

  const messages = [];
  let appTsConfig;
  let parsedTsConfig;
  let parsedCompilerOptions;
  try {
    const { config: readTsConfig, error } = ts.readConfigFile(
      paths.appTsConfig,
      ts.sys.readFile
    );

    if (error) {
      throw new Error(ts.formatDiagnostic(error, formatDiagnosticHost));
    }

    appTsConfig = readTsConfig;

    // Get TS to parse and resolve any "extends"
    // Calling this function also mutates the tsconfig above,
    // adding in "include" and "exclude", but the compilerOptions remain untouched
    let result;
    parsedTsConfig = immer(readTsConfig, (config) => {
      result = ts.parseJsonConfigFileContent(
        config,
        ts.sys,
        path.dirname(paths.appTsConfig)
      );
    });

    if (result.errors && result.errors.length) {
      throw new Error(
        ts.formatDiagnostic(result.errors[0], formatDiagnosticHost)
      );
    }

    parsedCompilerOptions = result.options;
  } catch (e) {
    if (e && e.name === "SyntaxError") {
      console.error(
        chalk.red.bold(
          "Could not parse",
          chalk.cyan("tsconfig.json") + ".",
          "Please make sure it contains syntactically correct JSON."
        )
      );
    }

    console.log(e && e.message ? `${e.message}` : "");
    process.exit(1);
  }

  if (appTsConfig.compilerOptions == null) {
    appTsConfig.compilerOptions = {};
    firstTimeSetup = true;
  }

  for (const option of Object.keys(compilerOptions)) {
    const { parsedValue, value, suggested, reason } = compilerOptions[option];

    const valueToCheck = parsedValue === undefined ? value : parsedValue;
    const coloredOption = chalk.cyan("compilerOptions." + option);

    if (suggested != null) {
      if (parsedCompilerOptions[option] === undefined) {
        appTsConfig = immer(appTsConfig, (config) => {
          config.compilerOptions[option] = suggested;
        });
        messages.push(
          `${coloredOption} to be ${chalk.bold(
            "suggested"
          )} value: ${chalk.cyan.bold(suggested)} (this can be changed)`
        );
      }
    } else if (parsedCompilerOptions[option] !== valueToCheck) {
      appTsConfig = immer(appTsConfig, (config) => {
        config.compilerOptions[option] = value;
      });
      messages.push(
        `${coloredOption} ${chalk.bold(
          valueToCheck == null ? "must not" : "must"
        )} be ${valueToCheck == null ? "set" : chalk.cyan.bold(value)}` +
          (reason != null ? ` (${reason})` : "")
      );
    }
  }

  // tsconfig will have the merged "include" and "exclude" by this point
  if (parsedTsConfig.include == null) {
    appTsConfig = immer(appTsConfig, (config) => {
      config.include = ["src"];
    });
    messages.push(
      `${chalk.cyan("include")} should be ${chalk.cyan.bold("src")}`
    );
  }

  if (messages.length > 0) {
    if (firstTimeSetup) {
      console.log(
        chalk.bold(
          "Your",
          chalk.cyan("tsconfig.json"),
          "has been populated with default values."
        )
      );
      console.log();
    } else {
      console.warn(
        chalk.bold(
          "The following changes are being made to your",
          chalk.cyan("tsconfig.json"),
          "file:"
        )
      );
      messages.forEach((message) => {
        console.warn("  - " + message);
      });
      console.warn();
    }
    writeJson(paths.appTsConfig, appTsConfig);
  }

  // Reference `react-scripts` types
  if (!fs.existsSync(paths.appTypeDeclarations)) {
    fs.writeFileSync(
      paths.appTypeDeclarations,
      `/// <reference types="react-scripts" />${os.EOL}`
    );
  }
}

module.exports = verifyTypeScriptSetup;
