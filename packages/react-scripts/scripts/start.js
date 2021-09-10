'use strict'

process.env.BABEL_ENV = 'development'
process.env.NODE_ENV = 'development'

process.on('unhandledRejection', (err) => {
  // throw err
})

const fs = require('fs')
const chalk = require('react-dev-utils/chalk')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const clearConsole = require('react-dev-utils/clearConsole')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const { choosePort, createCompiler, prepareUrls } = require('react-dev-utils/WebpackDevServerUtils')
const openBrowser = require('react-dev-utils/openBrowser')
const { mergeConfig } = require('../utils/initConfig')

const baseConfig = require('../configs/webpack.config.dev')
const webpackPaths = require('../configs/webpack.paths.js')

const config = mergeConfig(baseConfig)
const useYarn = fs.existsSync(webpackPaths.yarnLockFile)
const isInteractive = process.stdout.isTTY

if (!checkRequiredFiles([webpackPaths.appHtml, webpackPaths.appIndexJs])) {
  process.exit(1)
}

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 50051
const HOST = process.env.HOST || '0.0.0.0'

const { checkBrowsers } = require('react-dev-utils/browsersHelper')

checkBrowsers(webpackPaths.appRoot, isInteractive)
  .then(() => choosePort(HOST, DEFAULT_PORT))
  .then(async (port) => {
    if (port == null) {
      return
    }
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http'
    const appName = require(webpackPaths.appPackageJson).name
    const useTypeScript = fs.existsSync(webpackPaths.appTsConfig)

    const urls = prepareUrls(protocol, HOST, port, webpackPaths.publicUrlOrPath.slice(0, -1))
    const compiler = createCompiler({
      appName,
      config,
      urls,
      useYarn,
      useTypeScript,
      webpack,
    })
    const serverConfig = {
      ...config.devServer,
      host: HOST,
      port,
    }
    const devServer = new WebpackDevServer(serverConfig, compiler)

    try {
      await devServer.start()
      if (isInteractive) {
        clearConsole()
      }
      console.log(chalk.cyan('Starting the development server...\n'))
      compiler.hooks.done.tap('ezreal start', (stats) => {
        console.log()
        console.log()
        console.log(`  App running at:`)
        console.log(`  - Local:   ${chalk.cyan(urls.localUrlForTerminal)}`)
        console.log(`  - Network: ${chalk.cyan(urls.lanUrlForTerminal)}`)
        console.log()
      })
      openBrowser(urls.localUrlForBrowser)
    } catch (error) {
      return console.log(error)
    }

    ;['SIGINT', 'SIGTERM'].forEach(function (sig) {
      process.on(sig, async () => {
        await devServer.stop()
        process.exit()
      })
    })

    if (process.env.CI !== 'true') {
      process.stdin.on('end', async () => {
        await devServer.stop()
        process.exit()
      })
    }
  })
  .catch((err) => {
    if (err && err.message) {
      console.log(err.message)
    }
    process.exit(1)
  })
