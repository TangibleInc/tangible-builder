const path = require('path')
const browsersList = require('./browsers')

module.exports = function createBabelConfig(config) {

  const { src, root } = config.task || {}
  const { appRoot, appConfig = {}, packageJson, isServer } = config

  // If Preact is installed, automatically create alias
  if ((packageJson.dependencies && packageJson.dependencies.preact)
    || (packageJson.devDependencies && packageJson.devDependencies.preact)
  ) {
    appConfig.react = appConfig.react || 'preact'
  }

  let { alias, react = appConfig.react || 'React' } = config.task || {}
  if (react==='preact') {
    react = 'React' // For pragma
    alias = { 'react': 'preact/compat', 'react-dom': 'preact/compat', ...(alias || {}) }
  }

  const babelConfig = {
    presets: [
      [require.resolve('@babel/preset-env'),
        { modules: 'commonjs',
          targets: isServer
            ? { node: 'current' }
            : browsersList
        }
      ],
      [require.resolve('@babel/preset-react'), {
        // Ignore SVG namespace in React JSX
        // https://babeljs.io/docs/en/babel-preset-react/#throwifnamespace
        throwIfNamespace: false,
        pragma: `${react}.createElement`,
        pragmaFrag: `${react}.Fragment`,
      }],
      require.resolve('@babel/preset-typescript'),
    ],
    plugins: [

      // Stage 1

      // * https://babeljs.io/docs/en/next/babel-plugin-proposal-export-default-from
      require.resolve('@babel/plugin-proposal-export-default-from'),

      // https://babeljs.io/docs/en/next/babel-plugin-proposal-logical-assignment-operators
      //require.resolve('@babel/plugin-proposal-logical-assignment-operators'),

      // https://babeljs.io/docs/en/next/babel-plugin-proposal-pipeline-operator
      [require.resolve('@babel/plugin-proposal-pipeline-operator'), { 'proposal': 'minimal' }],

      // https://babeljs.io/docs/en/next/babel-plugin-proposal-do-expressions
      require.resolve('@babel/plugin-proposal-do-expressions'),

      // Stage 2

      // * https://babeljs.io/docs/en/next/babel-plugin-proposal-export-namespace-from
      require.resolve('@babel/plugin-proposal-export-namespace-from'),

      // https://babeljs.io/docs/en/next/babel-plugin-proposal-throw-expressions
      require.resolve('@babel/plugin-proposal-throw-expressions'),

      // Stage 3

      // https://babeljs.io/docs/en/next/babel-plugin-proposal-optional-chaining
      [require.resolve('@babel/plugin-proposal-optional-chaining'), { 'loose': false }],

      // https://babeljs.io/docs/en/next/babel-plugin-proposal-nullish-coalescing-operator
      [require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'), { 'loose': false }],

      // * Used for route/chunk-splitting
      require.resolve('@babel/plugin-syntax-dynamic-import'),

      // * https://babeljs.io/docs/en/next/babel-plugin-proposal-class-properties
      [require.resolve('@babel/plugin-proposal-class-properties'), { 'loose': false }],

      // ES2018
      // * https://babeljs.io/docs/en/next/babel-plugin-proposal-object-rest-spread
      require.resolve('@babel/plugin-proposal-object-rest-spread'),

      ...(isServer ? [] : [
        require.resolve('@babel/plugin-transform-runtime')
      ]),

      ...(react==='wp.element'
        ? []
        // Adds `import React from 'react'` if JSX is used
        : [require.resolve('../plugins/babel-plugin-react-require')])
      ,
    ]
  }

  if (root || alias) babelConfig.plugins.push(
    [require.resolve('babel-plugin-module-resolver'), {
      cwd: appRoot,
      root: typeof root==='string' ? [root] : root,
      alias,
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }]
  )

  return babelConfig
}
