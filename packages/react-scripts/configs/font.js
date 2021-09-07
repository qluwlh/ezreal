const getFontLoaders = () => {
  return [
    // WOFF Font
    {
      test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
      use: {
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          mimetype: 'application/font-woff',
        },
      },
    },
    // WOFF2 Font
    {
      test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
      use: {
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          mimetype: 'application/font-woff',
        },
      },
    },
    // OTF Font
    {
      test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
      use: {
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          mimetype: 'font/otf',
        },
      },
    },
    // TTF Font
    {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      use: {
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          mimetype: 'application/octet-stream',
        },
      },
    },
    // EOT Font
    {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      use: 'file-loader',
    },
  ]
}
module.exports = {
  getFontLoaders,
}
