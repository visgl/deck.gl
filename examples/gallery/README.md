# deck.gl Script Gallery

This directory contains standalone deck.gl examples that do not require installing dependencies or bundling.

## Usage

In the web browser, open any .html file from the `src` directory. Examples with base maps require Mapbox access tokens to render. Look for `<mapbox-access-token>` in the file and replace with your token. For more information, see [Mapbox access tokens](https://www.mapbox.com/help/how-access-tokens-work/).

## Contribute

Run local dev server:

```bash
# install dependencies
yarn
# start server
export MapboxAccessToken=<mapbox-access-token> && npm start
```

And open `http://localhost:3000` in the browser.

To add a new example:

- Add a single, self-contained .html file to `src`.
- Remove any private Mapbox token from the file and replace with `<mapbox-access-token>`.
- All external resources (data, 3rd-party libraries, etc.) must be loaded from publicly accessible URLs and NOT checked into this repo.
- Each html page should have a `<title>` tag.
- Add a thumbnail image (.png or .jpg) of the same name to `images`. The image is ideally 800x480 in size.
- Open a Pull Request.

## Test with Beta or Local Versions of deck.gl

To test all examples with the local version, run:

```bash
# rebuild bundle
cd ../../modules/main && npm run prepublishOnly && cd -
# start server
npm run start-local
```

To test all examples with a specific release:

```bash
node build-tools/serve --version=6.0.0-alpha.0
```

## Publish

```bash
npm run build
```

Copy contents of the `dist` directory to `showcases/gallery` in the gh-pages branch.
