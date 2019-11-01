# Contributing

PRs and bug reports are welcome, and we are actively opening up the deck.gl roadmap to facilitate for external contributors.


## Practicalities

Note that once your PR is about to be merged, you will be asked to register as a contributor by filling in a short form.


## Process and Guidelines

Developer documentation is available [here](https://github.com/uber/deck.gl/tree/master/dev-docs). We are ready to prepare additional documentation if requested by contributors.


## Developing deck.gl

### Node Version Requirement

Running deck.gl as a dependency in another project (e.g. via `npm i deck.gl`) requires Node `4.x` or higher. Building deck.gl from the source has a dependency on Node `10.x` or higher. Either upgrade to a supported version, or install something like [nvm](https://github.com/creationix/nvm) to manage Node versions.

### Install yarn

We use [yarn](https://yarnpkg.com/en/docs/install) to manage packages to install deck.gl

Note: on MacOS it is often convenient to install yarn with brew

```bash
brew update
brew install yarn
```

### Setting Up Dev Environment

The **master** branch is the active development branch.

```bash
git checkout master
yarn bootstrap
yarn test
```

Run the layer browser application:

```bash
cd examples/layer-browser
yarn
yarn start-local
```
