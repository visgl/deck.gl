/* eslint-disable max-len */
import * as dataSamples from '../data-samples';

import {S2Layer} from '@deck.gl/s2-layers';

const S2LayerExample = {
  layer: S2Layer,
  props: {
    data: dataSamples.s2cells,
    opacity: 0.6,
    getS2Token: f => f.token,
    getPath: f => f.path,
    getFillColor: f => [f.value * 255, (1 - f.value) * 255, (1 - f.value) * 128],
    getStrokeWidth: f => 10,
    pickable: true
  }
};

/* eslint-disable quote-props */
export default {
  'S2 Layers': {
    S2Layer: S2LayerExample
  }
};
