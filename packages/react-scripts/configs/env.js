const REACT_APP = /^REACT_APP_/i;

function getClientEnvironment(publicUrl) {
  const raw = Object.keys(process.env)
    .filter((key) => REACT_APP.test(key))
    .reduce(
      (env, key) => {
        env[key] = process.env[key];
        return env;
      },
      {
        NODE_ENV: process.env.NODE_ENV || "development",
        PUBLIC_URL: publicUrl,
        WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST,
        WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH,
        WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT,
        FAST_REFRESH: process.env.FAST_REFRESH !== "false",
      }
    );
  const stringified = {
    "process.env": Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {}),
  };

  return { raw, stringified };
}

module.exports = {
  development: {
    HOST: "https://classroom.dev.uskid.com",
    API_SERVER_URL: "https://dev.uskid.com/inside",
    CDN_URL: "https://dev.uskid.com",
    START_ENV: "development",
  },
  production: {
    HOST: "https://classroom.uskid.com",
    API_SERVER_URL: "https://api.uskid.com/inside",
    CDN_URL: "https://uskid.com",
    START_ENV: "production",
  },
  getClientEnvironment,
};
