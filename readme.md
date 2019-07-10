# Tangible Builder

## Install

Run `npm install` or `yarn`

## Config

Place a file called `tangible.config.js` in app root folder

#### Example

```js
module.exports = {
  build: [
    {
      task: 'js',
      src: 'src/index.js',
      dest: 'build/app.min.js',
      watch: 'src/**/*.js'
    },
    {
      task: 'sass',
      src: 'src/index.scss',
      dest: 'build/app.min.css',
      watch: 'src/**/*.scss'
    },
  ]
}
```

## Use

#### Develop

Build during development - watch files and rebuild

```sh
tgb dev
```

#### Build

Build for production - minified

```sh
tgb build
```
