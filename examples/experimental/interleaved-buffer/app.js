import {Deck, OrthographicView} from '@deck.gl/core';
import {ScatterplotLayer, PathLayer, SolidPolygonLayer} from '@deck.gl/layers';
import GL from '@luma.gl/constants';
import {Buffer} from '@luma.gl/core';

import data from './data';

/** DeckGL **/
const deck = new Deck({
  container: 'container',
  views: new OrthographicView(),
  controller: true,
  initialViewState: {
    target: [6, 6, 0],
    zoom: 5
  },
  onWebGLInitialized
});

function onWebGLInitialized(gl) {
  const buffer = new Buffer(gl, data);

  const positions = {buffer, type: GL.FLOAT, size: 3, offset: 4, stride: 16};
  const colors = {buffer, type: GL.UNSIGNED_BYTE, size: 4, offset: 0, stride: 16};
  const indices = new Uint16Array([0, 1, 2, 3, 4, 5, 4, 5, 6]);

  const layers = [
    new SolidPolygonLayer({
      id: 'polygons',
      data: {
        length: 2,
        startIndices: [0, 3],
        attributes: {
          indices,
          getPolygon: positions,
          getFillColor: colors
        }
      },
      pickable: true,
      autoHighlight: true,
      _normalize: false, // this instructs SolidPolygonLayer to skip normalization and use the binary as is
      getWidth: 0.5
    }),

    new PathLayer({
      id: 'paths',
      data: {
        length: 2,
        startIndices: [0, 3],
        attributes: {
          // PathLayer expects padded positions (1 vertex to the left & 2 vertices to the right)
          // So it cannot share the same buffer with other layers without padding
          // TODO - handle in PathTesselator?
          getPath: {value: data, size: 3, offset: 4, stride: 16},
          getColor: colors
        }
      },
      pickable: true,
      autoHighlight: true,
      _pathType: 'open', // this instructs PathLayer to skip normalization and use the binary as is
      getWidth: 0.5
    }),

    new ScatterplotLayer({
      id: 'points',
      data: {
        length: 7,
        attributes: {
          getPosition: positions,
          getLineColor: colors
        }
      },
      pickable: true,
      autoHighlight: true,
      stroked: true,
      filled: false,
      getRadius: 1,
      getLineWidth: 0.5
    })
  ];

  deck.setProps({layers});
}

/* global document */
document.body.style.margin = '0px';
