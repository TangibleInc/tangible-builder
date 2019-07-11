# Tangible Builder

## Install

#### As a Composer module

Add to (or create) in `composer.json`

```json
{
  "repositories": [
    {
      "type": "vcs",
      "url": "git@bitbucket.org:/tangibleinc/tangible-builder.git"
    }
  ],
  "require": {
    "tangible/builder": "dev-master"
  },
  "minimum-stability": "dev"
}
```

Add to (or create) in `package.json`

```json
{
  "scripts": {
    "preinstall": "cd vendor/tangible/builder && npm install",
    "dev": "./vendor/tangible/builder/run dev",
    "build": "./vendor/tangible/builder/run build"
  }
}
```

Then run the following commands to install

```sh
composer install
npm install
```

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

Make sure to build for production before a new Git commit

#### Develop

Build during development - watch files and rebuild

```sh
npm run dev
```

#### Build

Build for production - minified

```sh
npm run build
```
