## GraphLayer

The GraphLayer example lays out and renders a force-directed network graph.

Two primary layers are implemented in this example:

### `graph-layer`
A ["collection layer"](http://visgl.github.io/deck.gl/#/documentation/custom-layers/composite-layers) that delegates rendering to:
- a [ScatterplotLayer](http://visgl.github.io/deck.gl/#/documentation/layer-catalog/scatterplot-layer)
- a [LineLayer](http://visgl.github.io/deck.gl/#/documentation/layer-catalog/line-layer)
- (_optional_) a [IconLayer](http://visgl.github.io/deck.gl/#/documentation/layer-catalog/icon-layer)

### `graph-layout-layer`
An ["adaptor layer"](http://visgl.github.io/deck.gl/#/documentation/custom-layers/composite-layers) that links a layout (by default, `graph-simulation`, which uses [d3-force](https://github.com/d3/d3-force)) to the renderer.

To parse data into the format required by your layout, and to manage addition / removal of graph elements, use or write a graph "adaptor".
Currently, all three of [the existing adaptors](./graph-layer/adaptor) parse data into an array of `nodes` and `links`, but none yet offer support for addition/removal of nodes/links.

There are three different sample datasets; select the dataset to load and render via the `DATASET` const in `app.js`.


## Usage
Copy the content of this folder to your project. Run
```
npm install
npm start
```

## Data format
Sample datasets are stored in [deck.gl Example Data](https://github.com/visgl/deck.gl-data/tree/master/examples/graph).


## Attribution
[facebook-SNAP.csv](./data/facebook-SNAP.csv) from [Stanford Large Network Dataset Collection (SNAP)](http://snap.stanford.edu/data)
Authors: Jure Leskovec and Andrej Krevl
Published June 2014

[flare.json](./data/flare.json) from [Collapsable Force Layout](https://bl.ocks.org/mbostock/1062288) by [Mike Bostock](https://bl.ocks.org/mbostock).

[Icons](./data/nodeTypes.png) from [The Noun Project](https://thenounproject.com)
- Burger: [lipi](https://thenounproject.com/search/?q=burger&i=316378)
- Fries: [Daniel Llamas Soto](https://thenounproject.com/search/?q=fries&i=340356)
- Soda: [olcay kurtulus](https://thenounproject.com/search/?q=drink&i=667575)
- Pie: [Dara Ullrich](https://thenounproject.com/search/?q=pie+slice&i=674893)
