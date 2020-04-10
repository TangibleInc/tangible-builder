# Tangible Builder

Develop, build, beautify, schema, docs, test, serve

## Requirement

[Node.js](https://nodejs.org/en/) must be installed, with its package manager, `npm`.

## Install

Add to `package.json`

```json
{
  "scripts": {
    "dev": "tgb dev",
    "build": "tgb build"
  },
  "devDependencies": {
    "@tangible/builder": "*"
  }
}
```

Install

```sh
npm install
```

From the project root folder, the builder is available on the command line as `npx tgb`. Run it to show command descriptions.

## Config

Place a file called `tangible.config.js` in app root folder.

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

### Build Tasks

The property `build` is an array of build tasks.  Each task has the following schema.

| Property | Description |
|---|---|
| `task` | `js`, `sass`, or `html` |
| `src` | Source entry file (can use wildcards for html) |
| `dest` | Destination file (must be folder for html) |
| `watch` | Path of files to watch, in [glob syntax](https://github.com/isaacs/node-glob#glob-primer) |


### React

When building for React in the WordPress admin, add the following property to the `js` task.

```js
react: 'wp.element'
```

When using Preact for a compact frontend library, use the `alias` property.

```js
alias: {
  'react': 'preact/compat',
  'react-dom': 'preact/compat',
}
```


### TypeScript

For building TypeScript, change the `watch` property of the `js` task to add file extensions.

```js
watch: 'src/**/*.{js,ts,tsx}'
```


### Server

When using `html`, you can enable a static file server.

```js
module.exports = {
  build: [
    // ...
  ],
  serve: {
    dir: 'build',
    port: 3000,
    reload: true
  }
}
```

| Property | Description |
|---|---|
| `dir` | Folder to serve from, usually `build` |
| `port` | Port for the server |
| `reload` | Enable live-reload on file changes (optional) |

The server will run during `dev` or `serve` commands.


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

#### Lint and Beautify

The `lint` command ensures code standards, with warnings of any syntax/formatting issues.

```sh
npm run lint
```

The `beautify` command is similar to `lint`, but automatically fixes any issues with code standards.

```sh
npm run beautify
```

Commit any changes before running this command, because it can make changes to the code.


##### Exclude files

With some files, the beautify command has difficulty fixing them.

In that case, pass an option in the script in `package.json` to exclude the file.

For example, if the builder was installed as Composer module:

```
  "beautify": "./vendor/tangible/builder/run beautify --ignore=\"includes/file-name\\.php\""
```

If installed as NPM module:

```
  "beautify": "tgb beautify --ignore=\"includes/file-name\\.php\""
```

Note how double quotes *and period* must be escaped.
