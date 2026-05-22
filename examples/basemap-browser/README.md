# Basemap Browser

A TypeScript/React test application for quickly testing deck.gl with different basemap providers and configurations. Uses React function components throughout.

## Features

- **Multiple Basemap Providers**: Google Maps, Mapbox, MapLibre, and MapLibre Globe
- **Framework Variants**: Pure JS and React implementations (configurations from get-started examples)
- **Interleaved Mode Toggle**: Test both interleaved (shared GL context) and overlaid modes
- **Live Metrics**: Monitor Device Pixel Ratio and canvas dimensions in real-time
- **TypeScript**: Fully typed for better development experience

## Architecture

This example demonstrates both Pure JS and React integration patterns with deck.gl:

```
src/
├── types.ts                        # TypeScript type definitions
├── constants.ts                    # Shared constants
├── layers.ts                       # Shared layer configurations
├── examples/
│   └── index.ts                   # Example configurations
├── examples-pure-js/              # Pure JS implementations
│   ├── google-maps.ts
│   ├── mapbox.ts
│   ├── maplibre.ts
│   └── index.ts
├── examples-react/                # React implementations
│   ├── google-maps-component.tsx
│   ├── mapbox-component.tsx
│   ├── maplibre-component.tsx
│   └── index.ts
├── control-panel.tsx              # Control panel (separate React root)
└── index.tsx                      # Entry point
```

## Usage

```bash
# From the examples/basemap-browser directory
yarn
yarn start-local
```

Open http://localhost:8080 in your browser.

## Testing Resize and DPR Changes

1. **Window Resize Test**: Resize your browser window and verify that:
   - Layers redraw correctly
   - Canvas dimensions update
   - No visual artifacts appear

2. **Device Pixel Ratio Test**: Move the browser window between screens with different pixel ratios (e.g., from Retina to non-Retina display) and verify that:
   - DPR value updates in the control panel
   - Layers scale correctly without blur
   - Canvas drawing buffer dimensions adjust

3. **Interleaved vs Overlaid**: Toggle the "Interleaved Mode" checkbox and verify:
   - Both modes work correctly
   - Resize and DPR changes work in both modes
   - Layers render correctly in both modes

## Test Matrix

The basemap browser covers these configurations:

| Provider | Framework | Interleaved |
|----------|-----------|-------------|
| Google Maps | Pure JS | true |
| Google Maps | Pure JS | false |
| Google Maps | React | true |
| Google Maps | React | false |
| Mapbox | Pure JS | true |
| Mapbox | Pure JS | false |
| Mapbox | React | true |
| Mapbox | React | false |
| MapLibre | Pure JS | true |
| MapLibre | Pure JS | false |
| MapLibre | React | true |
| MapLibre | React | false |
| MapLibre Globe | Pure JS | true |
| MapLibre Globe | Pure JS | false |
| MapLibre Globe | React | true |
| MapLibre Globe | React | false |

## Google Maps Setup

To test Google Maps examples, you need to set environment variables:

```bash
export GoogleMapsAPIKey="your-api-key"
export GoogleMapsMapId="your-map-id"
```

Or add them to your `.env` file. The vite config will automatically inject them.

## Adding New Examples

To add a new basemap example:

1. Add layer configuration to `src/layers.ts` if needed
2. Add example config to `src/examples/index.ts`:

```typescript
'New Example': {
  name: 'New Example',
  mapType: 'maplibre', // or 'mapbox' or 'google-maps'
  framework: 'react',  // or 'pure-js'
  mapStyle: MAPLIBRE_STYLE,
  initialViewState: {
    latitude: 51.47,
    longitude: 0.45,
    zoom: 4,
    bearing: 0,
    pitch: 30
  },
  getLayers: getAirportLayers
}
```

## Relation to get-started Examples

This browser extracts the core layer configurations from the get-started examples into reusable functions:

- Layer configs in `src/layers.ts` match those in `examples/get-started/*/app.js`
- Constants in `src/constants.ts` are shared across all examples
- Example configurations in `src/examples/index.ts` use the same initial view states

## Known Issues

- Google Maps in overlaid mode (interleaved: false) may show a blank canvas when entering fullscreen

## Related PRs

- [#9886](https://github.com/visgl/deck.gl/pull/9886) - Canvas resize bug fix (9.2 branch)
- [#9887](https://github.com/visgl/deck.gl/pull/9887) - DPR fix for interleaved mode
