This is a [Vite](https://vitejs.dev) application that renders deck.gl layers as React
components with `@deck.gl/react`. It lists US airports, draws them over an interleaved
MapLibre map, and highlights the hovered and selected airport.

It shows the patterns from the [`@deck.gl/react` docs](../../../docs/developer-guide/react/get-started.md):

- `DeckGL` from `@deck.gl/react/maplibre` attaches its overlay to a map the app creates, through the `map` prop.
- `ScatterplotLayer` from `@deck.gl/react/layers` is an ordinary React component, so a feature
  component loads its data with hooks and returns the layer.
- Layers and DOM UI share one store (zustand) and one data cache (TanStack Query), and a layer
  inside `<Suspense>` waits for its data like any other component.

### Usage

```bash
# install dependencies
npm install
# or
yarn
# bundle and serve the app with vite
npm start
```

`@deck.gl/react` is the React renderer from deck.gl 10.0.0-alpha.2. Until that version is
published, run the example against the deck.gl source with `yarn start-local`, after installing
the root dependencies of a deck.gl checkout.

### Data and basemap

Airports come from Esri's public
[US Airport](https://services6.arcgis.com/ssFJjBXIUyZDrSYZ/arcgis/rest/services/US_Airport/FeatureServer/0)
feature service. The basemap is OpenStreetMap raster tiles; see the
[tile usage policy](https://operations.osmfoundation.org/policies/tiles/) before you deploy it.
