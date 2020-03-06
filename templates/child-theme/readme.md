# <% projectTitle %>

## Requirement

[Node.js](https://nodejs.org/en/) must be installed, with its package manager, `npm`.

You can download it from the above link to install the latest long-term stable version.

For more flexibility, install [`n`](https://github.com/mklement0/n-install), which allows switching between Node.js versions.

```sh
curl -L https://git.io/n-install | bash
```

## Install

Run the following command in the theme folder to install dependencies.

```
npm install
```

## Configure

For build configuration, see `tangible.config.js` and its explanation in the [`tangible-builder` repo](https://bitbucket.org/tangibleinc/tangible-builder).

## Use

#### Develop

Build during development - watch files and rebuild.

```sh
npm run dev
```

After running this command, it will wait and rebuild script and style as you edit the files.

Reload browser to see your changes.

When you're done, press CTRL+C to exit the process.

#### Build

Build for production - minify script and styles.

```sh
npm run build
```

Make sure to build for production before publishing.
