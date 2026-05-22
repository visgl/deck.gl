# Layer Browser

This is the main testing app for deck.gl development. It can only be run against source on the current branch.

```bash
# install root dependencies
../deck.gl$ yarn bootstrap

cd examples/layer-browser
# install app dependencies
yarn
# bundle and serve
yarn start-local
```

### Basemap

The basemap in this example is provided by [CARTO free basemap service](https://carto.com/basemaps). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)
