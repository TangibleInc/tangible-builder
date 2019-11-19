# Tangible Builder

Bundle and minify assets - JavaScript, Sass

## Requirement

[Node.js](https://nodejs.org/en/) must be installed, with its package manager, `npm`.

You can download it from the above link to install the latest long-term stable version.

For more flexibility, install [`n`](https://github.com/mklement0/n-install), which allows switching between Node.js versions.

```sh
curl -L https://git.io/n-install | bash
```

## Install

There are two ways to install this tool, as a Composer or NPM module.

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

Then run the following commands to install.

```sh
composer install
npm install
```

#### As a local NPM module

Add to `package.json`

```json
{
  "scripts": {
    "postinstall": "cd node_modules/@tangible/builder && composer install",
    "dev": "tgb dev",
    "build": "tgb build"
  }
}
```

Run the following command to install

```sh
npm install --save-dev @tangible/builder
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

The property `build` is an array of build tasks.  Each task has the following schema.

| Property | Description |
|---|---|
| `task` | `js` or `sass` |
| `src` | source entry file |
| `dest` | destination file |
| `watch` | path of files to watch, in [glob syntax](https://github.com/isaacs/node-glob#glob-primer) |

#### React

When using React and WordPress with the global `wp.element`, add the following property to the `js` task.

```js
react: 'wp.element'
```

## Use

Make sure to build for production before a new Git commit

#### Develop

Build during development - watch files and rebuild

```sh
npm run dev
```

After running this command, it will wait and rebuild script and style as you edit the files.

Reload browser to see your changes.

When you're done, press CTRL+C to exit the process.

#### Build

Build for production - minify script and style

```sh
npm run build
```

Make sure to build for production before publishing.
