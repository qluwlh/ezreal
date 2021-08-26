const webpackPaths = require("./webpack.paths.js");
const ignoredFiles = require("react-dev-utils/ignoredFiles");
const redirectServedPath = require("react-dev-utils/redirectServedPathMiddleware");

const sockHost = process.env.WDS_SOCKET_HOST;
const sockPath = process.env.WDS_SOCKET_PATH; // default: '/ws'
const sockPort = process.env.WDS_SOCKET_PORT;
const devServer = {
  bonjour: true,
  historyApiFallback: true,
  open: true,
  hot: true,
  compress: true,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers":
      "X-Requested-With, content-type, Authorization",
  },
  static: [
    {
      directory: webpackPaths.appPublic,
      publicPath: [webpackPaths.publicUrlOrPath],
      watch: {
        ignored: ignoredFiles(webpackPaths.appSrc),
      },
    },
    {
      directory: webpackPaths.appDist,
      publicPath: [webpackPaths.publicUrlOrPath],
      watch: {
        ignored: ignoredFiles(webpackPaths.appSrc),
      },
      staticOptions: {
        setHeaders: function (res, path) {
          if (path.toString().endsWith(".d.ts"))
            res.set("Content-Type", "application/javascript; charset=utf-8");
        },
      },
    },
  ],
  client: {
    webSocketURL: {
      hostname: sockHost,
      pathname: sockPath,
      port: sockPort,
    },
    overlay: true,
  },
  devMiddleware: {
    publicPath: webpackPaths.publicUrlOrPath.slice(0, -1),
  },
  onBeforeSetupMiddleware(devServer) {},
  onAfterSetupMiddleware(devServer) {
    devServer.app.use(redirectServedPath(webpackPaths.publicUrlOrPath));
  },
};

module.exports = { devServer };
