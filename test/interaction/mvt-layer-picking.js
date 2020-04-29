import {MapView} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';

const hoverEvents = [];

function onBeforeEvents() {
  // reset logs
  hoverEvents.length = 0;
}

export default {
  title: 'MVT Layer Picking',
  props: {
    width: 200,
    height: 200,
    views: new MapView(),
    initialViewState: {
      longitude: -74.006,
      latitude: 40.7128,
      zoom: 13,
      pitch: 0,
      bearing: 0
    },
    controller: true,
    onHover: (info, event) => hoverEvents.push({info, event}),
    layers: [
      new MVTLayer({
        id: 'mvt-layer',
        data: ['./test/data/mvt-tiles/{z}/{x}/{y}.mvt'],
        pickable: true,
        autoHighlight: true,
        uniqueIdProperty: 'cartodb_id',
        loadOptions: {
          mvt: {
            workerUrl: null
          }
        }
      })
    ]
  },
  getTestCases: t => [
    {
      name: 'hover',
      events: [{wait: 150}, {type: 'mousemove', x: 50, y: 50}, {wait: 100}],
      onBeforeEvents,
      onAfterEvents: ({deck, layers}) => {
        t.is(hoverEvents.length, 1, 'onHover is called');
        t.is(layers[0].state.highlightedFeatureId, 1862, 'highlighted feature is saved in state');
      }
    }
  ]
};
