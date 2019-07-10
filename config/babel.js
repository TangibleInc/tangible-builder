const wpBrowsersListConfig = require('@wordpress/browserslist-config')

module.exports = function createBabelConfig(config) {

  return {
    presets: [
      [ require.resolve('@babel/preset-env'),
        { modules: 'commonjs',
          targets: config.isServer
            ? { node: 'current' }
            : wpBrowsersListConfig
        }
      ],
      [require.resolve('@babel/preset-react'), {
        // Ignore SVG namespace in React JSX
        // https://babeljs.io/docs/en/babel-preset-react/#throwifnamespace
        throwIfNamespace: false
      }],
      require.resolve('@babel/preset-typescript'),
    ],
    plugins: [
      require.resolve('@babel/plugin-proposal-object-rest-spread'),
      require.resolve('@babel/plugin-proposal-class-properties'),
      require.resolve('@babel/plugin-proposal-export-default-from'),
    ]
  }

}
