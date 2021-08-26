const getFileLoaders = () => {
  return [
    {
      exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
      type: "asset/resource",
    },
  ];
};
module.exports = {
  getFileLoaders,
};
