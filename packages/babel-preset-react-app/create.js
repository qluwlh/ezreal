'use strict'

const developmentPlugins = [require('@babel/plugin-transform-runtime')]

const productionPlugins = [
  require('babel-plugin-dev-expression'),

  require('@babel/plugin-transform-react-constant-elements'),
  require('@babel/plugin-transform-react-inline-elements'),
  require('babel-plugin-transform-react-remove-prop-types'),
]

module.exports = function (api, opts, env) {
  if (!opts) {
    opts = {}
  }
  const isEnvDevelopment = env === 'development'

  return {
    presets: [
      [require('@babel/preset-env')],
      [
        require('@babel/preset-react'),
        {
          development: isEnvDevelopment,
          ...(opts.runtime !== 'automatic' ? { useBuiltIns: true } : {}),
          runtime: opts.runtime || 'classic',
        },
      ],
      require('@babel/preset-typescript'),
    ].filter(Boolean),
    plugins: [
      // Stage 0
      require('@babel/plugin-proposal-function-bind'),

      // Stage 1
      require('@babel/plugin-proposal-export-default-from'),
      require('@babel/plugin-proposal-logical-assignment-operators'),
      require('@babel/plugin-proposal-optional-chaining'),
      [require('@babel/plugin-proposal-pipeline-operator'), { proposal: 'minimal' }],
      require('@babel/plugin-proposal-nullish-coalescing-operator'),
      require('@babel/plugin-proposal-do-expressions'),

      // Stage 2
      [require('@babel/plugin-proposal-decorators'), { legacy: true }],
      require('@babel/plugin-proposal-function-sent'),
      require('@babel/plugin-proposal-export-namespace-from'),
      require('@babel/plugin-proposal-numeric-separator'),
      require('@babel/plugin-proposal-throw-expressions'),

      // Stage 3
      require('@babel/plugin-syntax-dynamic-import'),
      require('@babel/plugin-syntax-import-meta'),
      require('@babel/plugin-proposal-class-properties'),
      require('@babel/plugin-proposal-json-strings'),

      ...(isEnvDevelopment ? developmentPlugins : productionPlugins),
    ],
  }
}
