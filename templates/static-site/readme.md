# <%- projectTitle %>

## Requirement

[Node.js](https://nodejs.org/en/) must be installed, with its package manager, `npm`.

You can download it from the above link to install the latest long-term stable version.

For more flexibility, install [`n`](https://github.com/mklement0/n-install), which allows switching between Node.js versions.

```sh
curl -L https://git.io/n-install | bash
```

## Install

Run the following command in the app folder to install dependencies.

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

If the property `serve` is defined in the config, the command will also start a static file server. Visit `http://localhost:3000` to see `index.html`.

#### Build

Build for production - minified script and styles. Make sure to build for production before a new Git commit.


```sh
npm run build
```