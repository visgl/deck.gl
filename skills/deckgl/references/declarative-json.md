# Declarative deck.gl JSON (`@deck.gl/json`)

`@deck.gl/json` converts a JSON document into deck.gl props: layers, views, effects, widgets.
It is the natural interface when a program or an agent produces the map rather than hand-written
code, and it is what pydeck, kepler.gl-style configs and several agent products build on.

## Syntax

- `"@@type": "ScatterplotLayer"` selects a class from the converter's registry. Plain `"type"`
  is not recognized.
- `"@@function": "name"` calls a registered function with the sibling keys as its argument
  object. `"@@#Enum.VALUE"` resolves a registered constant or enumeration.
- `"@@=expression"` turns a string into an accessor. The expression runs in a small safe
  evaluator: property access, indexing, arithmetic, comparisons, logical and ternary operators,
  and array literals; `"getPosition": "@@=[lng, lat]"` is the standard form. Function calls
  (`Math.log`, `.toFixed`, `.includes`) throw at parse time; there is no optional chaining, no
  template literal and no object literal. Precompute transformations in the data instead.
- Top-level keys mirror `Deck` props: `initialViewState`, `views`, `layers`, `effects`,
  `getTooltip`, plus `mapStyle` in the scripting integration.

```json
{
  "initialViewState": {"longitude": 10, "latitude": 50, "zoom": 4},
  "views": [{"@@type": "MapView", "controller": true}],
  "layers": [{
    "@@type": "GeoJsonLayer",
    "id": "countries",
    "data": "https://example.com/countries.geojson",
    "filled": true,
    "getFillColor": "@@=properties.population > 5e7 ? [189, 0, 38] : [254, 217, 118]",
    "pickable": true
  }]
}
```

## The registry decides what exists

`new JSONConverter({configuration: {classes, functions, constants, enumerations, log}})`.
Only registered classes and functions are valid. There is no `interpolateColor`,
`quantileColorScale` or `colorBinScale` helper in the stock registry; color helpers such as
`colorBins`, `colorContinuous` and `colorCategories` exist only when `@deck.gl/carto` registers
them. Mapbox/MapLibre style expressions (`["interpolate", ["linear"], ["get", "x"], ...]`) are
not deck.gl accessors.

## Failure is silent today

- An unknown `@@type` or `@@function` is logged as a warning (the configuration's `log` defaults
  to `console`) and replaced with `null`. The map renders without that layer and **no error is thrown**.
- A wrong accessor expression can evaluate to `undefined` and become a transparent color or a
  zero radius. The map renders empty.
- Because of this, a converter used by an agent should: count layers in the spec versus layers
  produced and report any drop; configure `log` and surface warnings; validate the document
  before converting when a schema for the registry exists; and tell the agent exactly which
  names are legal. Treat "rendered but empty" as an error.

## Data

`data` accepts a URL, an array or a promise. For SQL, tiles, Arrow or vendor sources, register
a `@@function` source builder in the configuration; keep credentials out of the document and
inject them in the registered function.

## Direction of travel

A v2 of the module is tracked in `visgl/deck.gl-community` (issue #596): Zod-based schemas with
generated JSON Schema, LLM-friendly documentation and data-source declarations. Until then,
treat the registry configuration as the schema and validate against it explicitly.
