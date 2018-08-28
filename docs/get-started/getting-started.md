# Installing, Building and Running Examples

## Installation

First, you need to install the deck.gl (and luma.gl) frameworks

```bash
npm install deck.gl --save
```

or

```bash
yarn add deck.gl
```

> As of v5.0, installing deck.gl automatically installs a compatible version of luma.gl. However if your application directly uses the luma.gl API you may still need to explicitly install `luma.gl` with your app (see remarks below).

## Running the Examples

The deck.gl repository contains an [examples folder](https://github.com/uber/deck.gl/tree/6.1-release/examples) with a selection of small, standalone examples that could be good starting points for your application.

You should be able to copy these folders to your preferred locations, and get them running simply as follows:

Clone the deck.gl repo, if you haven't already

```bash
git clone git@github.com:uber/deck.gl.git
```

For most consistent results, it is recommended that you check out the latest release branch (e.g. `git checkout 6.1-release`) instead of `master` when running examples.

```bash
git checkout 6.1-release
```

Change directory to the example you are interested in

```bash
cd deck.gl/examples/...
```

Then install dependencies using the installer of your choice:

```bash
npm install
```

or

```bash
yarn
```

and then running using:

```bash
npm start
```

If the example uses a mapbox base map you need a [Mapbox access token](/docs/get-started/using-with-mapbox-gl.md)

```bash
export MapboxAccessToken={Your Token Here} && npm start
```

If you want to build the example against the latest deck.gl source code in the cloned repo (rather than the published version of deck.gl listed in the examples `package.json`)

```bash
npm run start-local
```

> The examples on the `master` branch are updated to use features from the latest, unreleased version of deck.gl. If some example doesn't work using `npm start` it can be worth trying `npm run start-local`.

> While all examples support `npm run start-local`, there are some caveats when running against local source. Most importantly, you must make sure to run `npm install` or `yarn` in the deck.gl root folder before running `npm run start-local` in an example folder.


## Remarks

* The need for explicitly installing luma.gl can depend on which installation tool you use (`npm install`, `yarn` etc) and exact behavior can vary between versions of these tools.
* When explicitly installing, there is a risk of getting multiple versions installed (deck.gl and luma.gl will warn at run-time in the console if multiple copies are detected). One of the best tools to debug such issues is `npm ls` and carefully checking your deck and luma version specifications in your package.json.
