"use strict";

process.on("unhandledRejection", (err) => {
  throw err;
});

const fs = require("fs-extra");
const path = require("path");
const chalk = require("react-dev-utils/chalk");
const execSync = require("child_process").execSync;
const spawn = require("react-dev-utils/crossSpawn");
const { defaultBrowsers } = require("react-dev-utils/browsersHelper");
const os = require("os");
const paths = require("../configs/webpack.paths");

const verifyTypeScriptSetup = require("./utils/verifyTypeScriptSetup");
function isInGitRepository() {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch (e) {
    return false;
  }
}

function isInMercurialRepository() {
  try {
    execSync("hg --cwd . root", { stdio: "ignore" });
    return true;
  } catch (e) {
    return false;
  }
}

function tryGitInit() {
  try {
    execSync("git --version", { stdio: "ignore" });
    if (isInGitRepository() || isInMercurialRepository()) {
      return false;
    }

    execSync("git init", { stdio: "ignore" });
    return true;
  } catch (e) {
    console.warn("Git repo not initialized", e);
    return false;
  }
}

function tryGitCommit(appPath) {
  try {
    execSync("git add -A", { stdio: "ignore" });
    execSync(
      'git commit -m "[Init]: Initialize project using @wanglihua/create-react-app"',
      { stdio: "ignore" }
    );
    return true;
  } catch (e) {
    console.warn("Git commit not created", e);
    console.warn("Removing .git directory...");
    try {
      // unlinkSync() doesn't work on directories.
      fs.removeSync(path.join(appPath, ".git"));
    } catch (removeErr) {
      // Ignore.
    }
    return false;
  }
}

module.exports = function (
  appPath,
  appName,
  verbose,
  originalDirectory,
  templateName
) {
  const appPackage = require(path.join(appPath, "package.json"));
  const useYarn = fs.existsSync(path.join(appPath, "yarn.lock"));

  if (!templateName) {
    console.log("");
    console.error(
      `A template was not provided. This is likely because you're using an outdated version of ${chalk.cyan(
        "create-react-app"
      )}.`
    );
    return;
  }

  const templatePath = path.dirname(
    require.resolve(`${templateName}/package.json`, { paths: [appPath] })
  );
  const templateJsonPath = path.join(templatePath, "template.json");

  let templateJson = {};
  if (fs.existsSync(templateJsonPath)) {
    templateJson = require(templateJsonPath);
  }

  const templatePackage = templateJson.package || {};

  // Keys to ignore in templatePackage
  const templatePackageBlacklist = [
    "name",
    "version",
    "description",
    "keywords",
    "bugs",
    "license",
    "author",
    "contributors",
    "files",
    "browser",
    "bin",
    "man",
    "directories",
    "repository",
    "peerDependencies",
    "bundledDependencies",
    "optionalDependencies",
    "engineStrict",
    "os",
    "cpu",
    "preferGlobal",
    "private",
    "publishConfig",
  ];

  // Keys from templatePackage that will be merged with appPackage
  const templatePackageToMerge = ["devDependencies", "dependencies", "scripts"];

  const templatePackageToReplace = Object.keys(templatePackage).filter(
    (key) => {
      return (
        !templatePackageBlacklist.includes(key) &&
        !templatePackageToMerge.includes(key)
      );
    }
  );

  const templateScripts = templatePackage.scripts || {};
  appPackage.scripts = {
    start: "react-scripts start",
    build: "react-scripts build",
    ...templateScripts,
  };

  appPackage.dependencies = appPackage.dependencies || {};

  if (useYarn) {
    appPackage.scripts = Object.entries(appPackage.scripts).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value.replace(/(npm run |npm )/, "yarn "),
      }),
      {}
    );
  }

  appPackage.eslintConfig = { extends: "@wanglihua@eslint-config-react-app" };

  appPackage.browserslist = defaultBrowsers;

  templatePackageToReplace.forEach((key) => {
    appPackage[key] = templatePackage[key];
  });

  fs.writeFileSync(
    path.join(appPath, "package.json"),
    JSON.stringify(appPackage, null, 2) + os.EOL
  );

  // Copy the files for the user
  const templateDir = path.join(templatePath, "template");
  if (fs.existsSync(templateDir)) {
    fs.copySync(templateDir, appPath);
  } else {
    console.error(
      `Could not locate supplied template: ${chalk.green(templateDir)}`
    );
    return;
  }

  // modifies README.md commands based on user used package manager.
  if (useYarn) {
    try {
      const readme = fs.readFileSync(path.join(appPath, "README.md"), "utf8");
      fs.writeFileSync(
        path.join(appPath, "README.md"),
        readme.replace(/(npm run |npm )/g, "yarn "),
        "utf8"
      );
    } catch (err) {
      // Silencing the error. As it fall backs to using default npm commands.
    }
  }

  const gitignoreExists = fs.existsSync(path.join(appPath, ".gitignore"));
  if (gitignoreExists) {
    const data = fs.readFileSync(path.join(appPath, "gitignore"));
    fs.appendFileSync(path.join(appPath, ".gitignore"), data);
    fs.unlinkSync(path.join(appPath, "gitignore"));
  } else {
    // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
    // See: https://github.com/npm/npm/issues/1862
    fs.moveSync(
      path.join(appPath, "gitignore"),
      path.join(appPath, ".gitignore"),
      []
    );
  }

  let initializedGit = false;

  if (tryGitInit()) {
    initializedGit = true;
    console.log();
    console.log("Initialized a git repository.");
  }

  let command;
  let remove;
  let args;
  let depArgs = [];
  let devDepArgs = [];
  if (useYarn) {
    command = "yarnpkg";
    remove = "remove";
    args = ["--registry", "https://registry.npm.taobao.org", "add"];
  } else {
    command = "npm";
    remove = "uninstall";
    args = [
      "install",
      "--no-audit", // https://github.com/facebook/create-react-app/issues/11174
      "--save",
      verbose && "--verbose",
    ].filter(Boolean);
  }

  const dependenciesToInstall = Object.entries(
    templatePackage.dependencies || {}
  );
  if (dependenciesToInstall.length) {
    depArgs = [
      ...args,
      ...dependenciesToInstall.map(([dependency, version]) => {
        return `${dependency}@${version}`;
      }),
    ];
  }
  const devDependenciesToInstall = Object.entries(
    templatePackage.devDependencies || {}
  );
  if (devDependenciesToInstall.length) {
    devDepArgs = [
      ...args,
      ...devDependenciesToInstall.map(([dependency, version]) => {
        return `${dependency}@${version}`;
      }),
    ];
  }

  if (templateName && depArgs.length > 1) {
    console.log();
    console.log(`Installing template dependencies using ${command}...`);

    const proc = spawn.sync(command, depArgs, { stdio: "inherit" });
    if (proc.status !== 0) {
      console.error(`\`${command} ${depArgs.join(" ")}\` failed`);
      return;
    }
  }
  if (templateName && devDepArgs.length > 1) {
    console.log();
    console.log(`Installing template devDependencies using ${command}...`);

    const proc = spawn.sync(
      command,
      [...devDepArgs, useYarn ? "--dev" : "--save-dev"],
      {
        stdio: "inherit",
      }
    );
    if (proc.status !== 0) {
      console.error(`\`${command} ${devDepArgs.join(" ")}\` failed`);
      return;
    }
  }
  if (devDepArgs.find((arg) => arg.includes("typescript"))) {
    console.log();
    // verifyTypeScriptSetup();
  }

  // Remove template
  console.log(`Removing template package using ${command}...`);
  console.log();

  // const proc = spawn.sync(command, [remove, templateName], {
  //   stdio: "inherit",
  // });
  // if (proc.status !== 0) {
  //   console.error(`\`${command} ${args.join(" ")}\` failed`);
  //   return;
  // }

  // Create git commit if git repo was initialized
  if (initializedGit && tryGitCommit(appPath)) {
    console.log();
    console.log("Created git commit.");
  }

  // Display the most elegant way to cd.
  // This needs to handle an undefined originalDirectory for
  // backward compatibility with old global-cli's.
  let cdpath;
  if (originalDirectory && path.join(originalDirectory, appName) === appPath) {
    cdpath = appName;
  } else {
    cdpath = appPath;
  }

  // Change displayed command to yarn instead of yarnpkg
  const displayedCommand = useYarn ? "yarn" : "npm";

  console.log();
  console.log(`Success! Created ${appName} at ${appPath}`);
  console.log("Inside that directory, you can run several commands:");
  console.log();
  console.log(chalk.cyan(`  ${displayedCommand} start`));
  console.log("    Starts the development server.");
  console.log();
  console.log(
    chalk.cyan(`  ${displayedCommand} ${useYarn ? "" : "run "}build`)
  );
  console.log("    Bundles the app into static files for production.");
  console.log();
  console.log("We suggest that you begin by typing:");
  console.log();
  console.log(chalk.cyan("  cd"), cdpath);
  console.log(`  ${chalk.cyan(`${displayedCommand} start`)}`);
  console.log();
  console.log("Happy hacking!");
};
