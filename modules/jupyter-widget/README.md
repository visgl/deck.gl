# @deck.gl/jupyter-widget

[![Github Actions Status](https://github.com/visgl/deck.gl.git/workflows/Build/badge.svg)](https://github.com/visgl/deck.gl.git/actions/workflows/build.yml)
Jupyter widget for rendering deck.gl in a Jupyter notebook

See [deck.gl](http://deck.gl) for documentation.

**IMPORTANT:** The instructions below involving pip currently **do not work**. Instead, run `jlpm build` and then copy the directory `pydeck/labextension` to `<sys-prefix>/share/jupyter/labextensions/@deck.gl/jupyter-widget`. Looking into packaging through a normal pydeck pip install in the future.

## Requirements

- JupyterLab >= 3.0

## Install

To install the extension, execute:

```bash
pip install pydeck
```


## Uninstall

To remove the extension, execute:

```bash
pip uninstall pydeck
```


## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jupyter-widget directory
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall pydeck
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `@deck.gl/jupyter-widget` within that folder.

### Packaging the extension

See [RELEASE](RELEASE.md)
