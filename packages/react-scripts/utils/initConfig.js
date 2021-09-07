const path = require('path')
const { existsSync } = require('fs')
const { merge } = require('webpack-merge')
const webpack = require('webpack')

const DEFAULT_CONFIG_FILES = [
  'ezreal.config.ts',
  'ezreal.config.js',
  'config/config.ts',
  'config/config.js',
]

function getUserConfig() {
  const cwd = process.cwd()
  const configFile = DEFAULT_CONFIG_FILES.find((file) => {
    return existsSync(path.join(cwd, file))
  })
  if (!configFile) {
    return {}
  }
  const genFile = require(path.join(cwd, configFile))
  return genFile(webpack) || {}
}

function mergeConfig(defaultConfig) {
  const config = getUserConfig()
  return merge(defaultConfig, config)
}
module.exports = {
  getUserConfig,
  mergeConfig,
}
