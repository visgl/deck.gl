# ColumnLayer Cap Shape Example

This example demonstrates the new `capShape` property for the ColumnLayer, which allows you to customize the top of columns.

## Running this example

To run this example, you need to install dependencies first:

```bash
# From the repository root
cd examples/get-started/pure-js/column-cap-shape
yarn
yarn start
```

Or to use the local development version of deck.gl:

```bash
yarn start-local
```

## Features

The example shows:
- **Cap Shape Selection**: Switch between flat (default), rounded (dome), and pointy (cone) column tops
- **Disk Resolution**: Adjust the number of sides (4-40) to see how it affects geometry smoothness
- **Interactive Controls**: Real-time updates when changing settings
- **3D Visualization**: Rotate and zoom to inspect columns from different angles

## Usage

```javascript
new ColumnLayer({
  data: myData,
  extruded: true,
  capShape: 'rounded', // 'flat' | 'rounded' | 'pointy'
  diskResolution: 20,
  getPosition: d => d.position,
  getElevation: d => d.elevation,
  getFillColor: d => d.color
});
```

## Cap Shapes

- **`flat`** (default): Traditional flat top - preserves original behavior
- **`rounded`**: Dome-shaped top, like a silo - uses multiple latitude rings
- **`pointy`**: Cone-shaped top, like a missile - converges to a single apex point
