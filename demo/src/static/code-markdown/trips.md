This demo showcases a custom layer `TripsLayer`. To use this layer, you need to copy
the [trips-layer source](https://github.com/uber/deck.gl/tree/master/examples/sample-layers)
into your project folder.

[Documentation](https://github.com/uber/deck.gl/blob/master/examples/sample-layers/trips-layer/README.md) of
`TripsLayer`'s API.

```
import React, {Component} from 'react';
import DeckGL, {GeoJsonLayer} from 'deck.gl';
import TripsLayer from './trips-layer';
import TWEEN from 'tween.js';

export default class TripsDemo extends Component {

  constructor(props) {
    super(props);

    const thisDemo = this;

    this.state = {
      time: 0
    };
    this.tween = new TWEEN.Tween({time: 0})
      .to({time: 3600}, 120000)
      .onUpdate(function() { thisDemo.setState(this) })
      .repeat(Infinity);
  }

  componentDidMount() {
    const thisDemo = this;
    this.tween.start();
  }

  componentWillUnmount() {
    this.tween.stop();
  }

  _initialize(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  render() {
    const {viewport, tripsData, buildingData} = this.props;

    if (!data) {
      return null;
    }

    const layers = [].concat(
      data[0] && data[0].map((layerData, layerIndex) => new TripsLayer({
        id: `trips-${layerIndex}`,
        data: layerData,
        getPath: d => d.segments,
        getColor: d => d.vendor === 0 ? [253, 128, 93] : [23, 184, 190],
        opacity: 0.3,
        strokeWidth: 2,
        trailLength: params.trail.value,
        currentTime: this.state.time
      })),
      data[1] && data[1].map((d, i) => new GeoJsonLayer({
        id: `building=${i}`,
        data: d,
        extruded: true,
        fp64: true,
        getElevation: f => f.properties.height,
        getFillColor: f => [74, 80, 87],
        opacity: 0.5
      }))
    ).filter(Boolean);

    return (
      <DeckGL {...viewport} layers={layers} onWebGLInitialized={this._initialize} />
    );
  }
}
```