const path = require('path')
const browsersList = require('./browsers')

module.exports = function createBabelConfig(config) {

  const { src, root, alias, react = 'React' } = config.task || {}

  const babelConfig = {
    presets: [
      [ require.resolve('@babel/preset-env'),
        { modules: 'commonjs',
          targets: config.isServer
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
      require.resolve('@babel/plugin-proposal-object-rest-spread'),
      require.resolve('@babel/plugin-proposal-class-properties'),
      require.resolve('@babel/plugin-proposal-export-default-from'),
      ...(react==='wp.element'
        ? []
        // Adds `import React from 'react'` if JSX is used
        : [require.resolve('../plugins/babel-plugin-react-require')])
      ,
    ]
  }

  if (root || alias) babelConfig.plugins.push(
    [require.resolve('babel-plugin-module-resolver'), {
      root: typeof root==='string' ? [root] : root,
      alias
    }]
  )

  return babelConfig
}
