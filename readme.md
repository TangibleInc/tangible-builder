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
    },
    {
      task: 'sass',
      src: 'src/index.scss',
      dest: 'build/app.min.css',
    },
  ]
}
```

## Use

#### Develop

Build during development

```sh
tgb dev
```

#### Build

Build for production

```sh
tgb build
```
