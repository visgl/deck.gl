This is a minimal standalone version of the BrushingLayer example
on [deck.gl](http://deck.gl) website.

### Usage
- Copy the content of this folder to your project. 

- Install Package
```
npm install
```

- Delete last line in `webpack.config.js`
```
module.exports = require('../webpack.config.local')(module.exports);
```

- Add [Mapbox access token](https://www.mapbox.com/help/define-access-token/) 
by run this command in your terminal.

```
export MapboxAccessToken=<Your_Token>
```

or you can directly add it to `app.js`
```
// Set your mapbox token here
const MAPBOX_TOKEN = <Your_Token>>;
```
- Start the app. 
```
npm start
```

### Data format
Sample data is stored in [deck.gl Example Data](https://github.com/uber-common/deck.gl-data/tree/master/examples/arc). To use your own data, checkout
the [documentation of ArcLayer](../../../docs/layers/arc-layer.md).
