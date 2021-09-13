const getFileLoaders = () => {
  return [
    {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      use: {
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          mimetype: 'image/svg+xml',
        },
      },
    },
    // {
    //   test: /\.svg$/,
    //   use: {
    //     loader: require.resolve("url-loader"),
    //     options: { esModule: false },
    //   },
    // },
    {
      test: /\.(png|jpe?g|gif|webp|ico)$/i,
      type: 'asset',
    },
    // {
    //   test: /\.(|otf|ttf|eot|woff|woff2)$/i,
    //   type: "asset/resource",
    // },
    // {
    //   exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
    //   type: "asset/resource",
    // },
    {
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      type: 'asset/resource',
    },
  ]
}
module.exports = {
  getFileLoaders,
}
