"use strict";

const chalk = require("chalk");
const commander = require("commander");
const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const spawn = require("cross-spawn");
const validateProjectName = require("validate-npm-package-name");
const packageJson = require("./package.json");

let projectName;

function init() {
  const program = new commander.Command(packageJson.name)
    .version(packageJson.version)
    .arguments("<project-directory>")
    .usage(`${chalk.green("<project-directory>")} [options]`)
    .action((name) => {
      projectName = name;
    })
    .allowUnknownOption()
    .on("--help", () => {
      console.log(`${chalk.green("<project-directory>")} is required.`);
    })
    .parse(process.argv);

  if (typeof projectName === "undefined") {
    console.error("Please specify the project directory:");
    process.exit(1);
  }
  createApp(projectName);
}

function createApp(name) {
  const root = path.resolve(name);
  const appName = path.basename(root);
  checkAppName(appName);
  fs.ensureDirSync(name);
  if (!isSafeToCreateProjectIn(root, name)) {
    process.exit(1);
  }

  console.log();
  console.log(`Creating a new React app in ${chalk.green(root)}.`);
  console.log();

  const packageJson = {
    name: appName,
    version: "0.1.0",
    private: true,
  };
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify(packageJson, null, 2) + os.EOL
  );
  const originalDirectory = process.cwd();
  process.chdir(root);
  run(root, appName, originalDirectory);
}

function install(root, dependencies) {
  return new Promise((resolve, reject) => {
    const command = "yarnpkg";
    const args = [
      "--registry",
      "https://registry.npm.taobao.org",
      "add",
      ...dependencies,
      "--cwd",
      root,
    ];
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("close", (code) => {
      if (code !== 0) {
        reject({ command: `${command} ${args.join(" ")}` });
        return;
      }
      resolve();
    });
  });
}

const run = async (root, appName, originalDirectory) => {
  const [packageToInstall, templateToInstall] = await Promise.all([
    getInstallPackage(),
    getTemplateInstallPackage(),
  ]);
  const allDependencies = [
    "react",
    "react-dom",
    packageToInstall,
    templateToInstall,
  ];

  console.log("Installing packages. This might take a couple of minutes.");

  await install(root, allDependencies);

  const nodeArgs = [];
  await executeNodeScript(
    {
      cwd: process.cwd(),
      args: nodeArgs,
    },
    [root, appName, false, originalDirectory, templateToInstall],
    `
    var init = require('${packageToInstall}/scripts/init.js');
    init.apply(null, JSON.parse(process.argv[1]));
  `
  );
};
function executeNodeScript({ cwd, args }, data, source) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [...args, "-e", source, "--", JSON.stringify(data)],
      { cwd, stdio: "inherit" }
    );
    child.on("close", (code) => {
      if (code !== 0) {
        reject({ command: `node ${args.join(" ")}` });
        return;
      } else {
        resolve();
      }
    });
  });
}

function getInstallPackage() {
  let packageToInstall = "@wanglihua/react-scripts";
  return Promise.resolve(packageToInstall);
}

function getTemplateInstallPackage(template = "typescript") {
  let templateToInstall = `@wanglihua/cra-template-${template}`;
  return Promise.resolve(templateToInstall);
}

function checkAppName(appName) {
  const validationResult = validateProjectName(appName);
  if (!validationResult.validForNewPackages) {
    console.error(
      chalk.red(
        `Cannot create a project named ${chalk.green(
          `"${appName}"`
        )} because of npm naming restrictions:\n`
      )
    );
    [
      ...(validationResult.errors || []),
      ...(validationResult.warnings || []),
    ].forEach((error) => {
      console.error(chalk.red(`  * ${error}`));
    });
    console.error(chalk.red("\nPlease choose a different project name."));
    process.exit(1);
  }

  // TODO: there should be a single place that holds the dependencies
  const dependencies = ["react", "react-dom", "react-scripts"].sort();
  if (dependencies.includes(appName)) {
    console.error(
      chalk.red(
        `Cannot create a project named ${chalk.green(
          `"${appName}"`
        )} because a dependency with the same name exists.\n` +
          `Due to the way npm works, the following names are not allowed:\n\n`
      ) +
        chalk.cyan(dependencies.map((depName) => `  ${depName}`).join("\n")) +
        chalk.red("\n\nPlease choose a different project name.")
    );
    process.exit(1);
  }
}

function isSafeToCreateProjectIn(root, name) {
  const validFiles = [
    ".DS_Store",
    ".git",
    ".gitattributes",
    ".gitignore",
    ".gitlab-ci.yml",
    ".hg",
    ".hgcheck",
    ".hgignore",
    ".idea",
    ".npmignore",
    ".travis.yml",
    "docs",
    "LICENSE",
    "README.md",
    "mkdocs.yml",
    "Thumbs.db",
  ];
  // These files should be allowed to remain on a failed install, but then
  // silently removed during the next create.
  const errorLogFilePatterns = [
    "npm-debug.log",
    "yarn-error.log",
    "yarn-debug.log",
  ];
  const isErrorLog = (file) => {
    return errorLogFilePatterns.some((pattern) => file.startsWith(pattern));
  };

  const conflicts = fs
    .readdirSync(root)
    .filter((file) => !validFiles.includes(file))
    // IntelliJ IDEA creates module files before CRA is launched
    .filter((file) => !/\.iml$/.test(file))
    // Don't treat log files from previous installation as conflicts
    .filter((file) => !isErrorLog(file));

  if (conflicts.length > 0) {
    console.log(
      `The directory ${chalk.green(name)} contains files that could conflict:`
    );
    console.log();
    for (const file of conflicts) {
      try {
        const stats = fs.lstatSync(path.join(root, file));
        if (stats.isDirectory()) {
          console.log(`  ${chalk.blue(`${file}/`)}`);
        } else {
          console.log(`  ${file}`);
        }
      } catch (e) {
        console.log(`  ${file}`);
      }
    }
    console.log();
    console.log(
      "Either try using a new directory name, or remove the files listed above."
    );

    return false;
  }

  // Remove any log files from a previous installation.
  fs.readdirSync(root).forEach((file) => {
    if (isErrorLog(file)) {
      fs.removeSync(path.join(root, file));
    }
  });
  return true;
}

module.exports = {
  init,
  getTemplateInstallPackage,
};
