
# TerrainExtension (Experimental)

> This extension is experimental, which means it does not provide the compatibility and stability that one would typically expect from other features. Use with caution and report any issues that you find on GitHub.

The `TerrainExtension` renders otherwise 2D data along a 3D surface. For example, a GeoJSON of city streets and building footprints can be overlaid on top of a [elevation model](https://en.wikipedia.org/wiki/Digital_elevation_model). It is useful when viewing a mixture of 2D and 3D data sources. The re-positioning of geometries is performed on the GPU.

To use this extension, first define a terrain source with the prop `operation: 'terrain'` or `operation: 'terrain+draw'`. A terrain source provides the 3D surface to fit other data on to.

For each layer that should be fitted to the terrain surface, add the `TerrainExtension` to its `extensions` prop.

<div style={{position:'relative',height:450}}></div>
<div style={{position:'absolute',transform:'translateY(-450px)',paddingLeft:'inherit',paddingRight:'inherit',left:0,right:0}}>
  <iframe height="450" style={{width: '100%'}} scrolling="no" title="deck.gl TerrainExtension" src="https://codepen.io/vis-gl/embed/VwGLLeR?height=450&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
    See the Pen <a href='https://codepen.io/vis-gl/pen/VwGLLeR'>deck.gl TerrainExtension</a> by vis.gl
    (<a href='https://codepen.io/vis-gl'>@vis-gl</a>) on <a href='https://codepen.io'>CodePen</a>.
  </iframe>
</div>


```js
import {GeoJsonLayer} from '@deck.gl/layers';
import {TerrainLayer} from '@deck.gl/geo-layers';
import {_TerrainExtension as TerrainExtension} from '@deck.gl/extensions';

const layers = [
  new TerrainLayer({
      id: 'terrain',
      minZoom: 0,
      maxZoom: 23,
      strategy: 'no-overlap',
      elevationDecoder: {
        rScaler: 6553.6,
        gScaler: 25.6,
        bScaler: 0.1,
        offset: -10000
      },
      elevationData: `https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.png?access_token=${MAPBOX_TOKEN}`,
      texture: `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.png?access_token=${MAPBOX_TOKEN}`,
      operation: 'terrain+draw'
    }),
    new GeoJsonLayer({
      data,
      getFillColor: [0, 160, 180, 200],
      getLineColor: [220, 80, 0],
      getLineWidth: 50,
      getPointRadius: 150,
      extensions: [new TerrainExtension()]
    })
];
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/extensions
```

```js
import {_TerrainExtension as TerrainExtension} from '@deck.gl/extensions';
new TerrainExtension();
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/extensions@^9.0.0/dist.min.js"></script>
```

```js
new deck._TerrainExtension();
```

## Constructor

```js
new TerrainExtension();
```

## Layer Properties

When added to a layer via the `extensions` prop, the `TerrainExtension` adds the following properties to the layer:

#### `terrainDrawMode` ('offset' | 'drape') {#terraindrawmode}

How data should be fitted to the terrain surface. If not specified, will be automatically determined from the layer type.

- `offset`: each object is translated vertically by the elevation at its anchor (usually defined by an accessor called `getPosition`, e.g. icon, scatterplot). This is the desired behavior for layers that render 3D objects.
- `drape`: each object is overlaid as a texture over the terrain surface. All altitude and extrusion in the layer will be ignored.

<table style={{border:0}} align="center">
  <tbody>
    <tr>
      <td>
        <img style={{maxHeight:216}} src="https://raw.githubusercontent.com/visgl/deck.gl-data/master/images/docs/terrain-fit-offset.jpg" />
        <p><i>terrainDrawMode: offset</i></p>
      </td>
      <td>
        <img style={{maxHeight:216}} src="https://raw.githubusercontent.com/visgl/deck.gl-data/master/images/docs/terrain-fit-drape.jpg" />
        <p><i>terrainDrawMode: drape</i></p>
      </td>
    </tr>
  </tbody>
</table>

## Source

[modules/extensions/src/terrain](https://github.com/visgl/deck.gl/tree/8.6-release/modules/extensions/src/terrain)
