const path = require('path')
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath')

const resolvePath = (resolveRoot) => (filePath) => {
  return path.join(resolveRoot, filePath)
}

const appRoot = path.join(__dirname, '..')
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
  appSrc,
  appDist,
  appPublic,
  appHtml: resolvePublic('index.html'),
  appIndexJs: resolveSrc('index.ts'),
  appPackageJson: resolveApp('package.json'),
  appTsConfig: resolveApp('tsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  publicUrlOrPath,
}
