This is a [Next.js](https://nextjs.org) App Router application that renders deck.gl layers as
React components with `@deck.gl/react`. It is the same airports app as the [Vite example](../vite),
arranged the way a Next.js app with React Server Components is.

- Server components load the airports (`src/data-access/airports/server.ts`) and pass them to
  client components, which render the layer, the list and the card.
- Every module that renders `DeckGL` or a layer component is a client module (`'use client'`).
- The search and the selected airport live in the URL ([nuqs](https://nuqs.dev)), so the server
  renders the same view on reload.
- `/` renders the layer into an interleaved MapLibre map from `@deck.gl/react/maplibre`.
  `/standalone-a` uses the standalone `DeckGL` root without a basemap, and `/standalone-b` passes
  it a `canvas` the page renders.

### Usage

```bash
# install dependencies
npm install
# or
yarn
# start the development server
npm start
```

`npm start` uses `@deck.gl/react` 10.0.0-alpha.2 or later from npm. To run the example against
the deck.gl source instead, build the packages from the root of a deck.gl checkout (`yarn build`),
then run `yarn start-local` here. It runs `next dev --webpack` and resolves `@deck.gl/*` to the
packages in the checkout.

### Data and basemap

Airports come from Esri's public
[US Airport](https://services6.arcgis.com/ssFJjBXIUyZDrSYZ/arcgis/rest/services/US_Airport/FeatureServer/0)
feature service. The basemap is OpenStreetMap raster tiles; see the
[tile usage policy](https://operations.osmfoundation.org/policies/tiles/) before you deploy it.
