# Layer Browser

This is the main testing app for deck.gl development. It can only be run against source on the current branch.

To see the base map, you need a [Mapbox access token](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/):

```bash
export MapboxAccessToken=<mapbox_access_token>
```

```bash
# install root dependencies
../deck.gl$ yarn bootstrap

cd examples/layer-browser
# install app dependencies
yarn
# bundle and serve
yarn start-local
```
