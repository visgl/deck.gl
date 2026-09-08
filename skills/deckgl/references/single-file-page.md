# A single self-contained page

Use this when the deliverable is one HTML file: an artifact, a demo, a gist, a slide.

## Choose the tool honestly

- A few markers with popups on a slippy map: a plain base map library is smaller and simpler;
  deck.gl adds nothing there.
- Thousands of features, data-driven color or size, aggregation, 3D, animation, or anything
  that must stay smooth while panning: MapLibre for the basemap, deck.gl for the data.

## The recipe (deck.gl 9.4, MapLibre 5, no tokens)

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <link href="https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css" rel="stylesheet">
  <style>html, body, #map { margin: 0; height: 100%; }</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.js"></script>
<script src="https://unpkg.com/deck.gl@9.4.0/dist.min.js"></script>
<script>
  const map = new maplibregl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json', // token-free
    center: [10, 20], zoom: 1.5
  });
  const overlay = new deck.MapLibreOverlay({ // deck.MapboxOverlay on 9.3 and earlier
    layers: [
      new deck.ScatterplotLayer({
        id: 'points',
        data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/line/airports.json',
        getPosition: d => d.coordinates,
        getFillColor: d => d.type === 'major' ? [255, 90, 60] : [255, 200, 60],
        getRadius: d => d.type === 'major' ? 6 : 3,
        radiusUnits: 'pixels',
        pickable: true
      })
    ],
    getTooltip: ({object}) => object && `${object.name} (${object.abbrev})`
  });
  map.addControl(overlay);
</script>
</body>
</html>
```

## Checklist

- Pin exact, existing versions. `deck.gl@8.10.1` does not exist; the CDN returns an HTML page
  and the script never runs.
- `map.addControl(overlay)`, never `map.addLayer(overlay)`.
- Do not name a variable `deck` when the bundle's global is `deck`.
- Set `pickable: true` for tooltips; put a legend on the page for every encoded field.
- Some sandboxed hosts allow scripts only from specific CDNs (often cdnjs and jsdelivr) and
  block tile and data requests. Check the host's policy before promising a basemap.
- Open the file in a browser and look at it before declaring it done.
