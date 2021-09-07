const path = require('path')
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath')
const fs = require('fs')

const appRoot = fs.realpathSync(process.cwd())

const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
]
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find((extension) =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  )

  if (extension) {
    return resolveFn(`${filePath}.${extension}`)
  }

  return resolveFn(`${filePath}.js`)
}

const resolvePath = (resolveRoot) => (filePath) => {
  return path.join(resolveRoot, filePath)
}

const resolveApp = resolvePath(appRoot)

const appSrc = resolveApp('src')
const resolveSrc = resolvePath(appSrc)

const appDist = resolveApp('dist')
const resolveDist = resolvePath(appDist)

const appPublic = resolveApp('public')
const resolvePublic = resolvePath(appPublic)

const publicUrlOrPath = getPublicUrlOrPath(
  process.env.NODE_ENV === 'development',
  require(resolveApp('package.json')).homepage,
  process.env.PUBLIC_URL
)

module.exports = {
  appRoot,
  appPath: appRoot,
  appSrc,
  appDist,
  appPublic,
  appHtml: resolvePublic('index.html'),
  appIndexJs: resolveModule(resolveSrc, 'index'),
  appPackageJson: resolveApp('package.json'),
  appTsConfig: resolveApp('tsconfig.json'),
  appNodeModules: resolveApp('node_modules'),
  yarnLockFile: resolveApp('yarn.lock'),
  appTypeDeclarations: resolveSrc('react-app-env.d.ts'),
  publicUrlOrPath,
  resolveSrc,
  resolveApp,
  resolveDist,
  resolvePublic,
}
