import {MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

const clickEvents = [];
const hoverEvents = [];

function onBeforeEvents() {
  // reset logs
  clickEvents.length = 0;
  hoverEvents.length = 0;
}

export default {
  title: 'Picking',
  props: {
    width: 800,
    height: 400,
    views: new MapView(),
    initialViewState: {
      longitude: -122,
      latitude: 38,
      zoom: 14,
      pitch: 30,
      bearing: -45
    },
    controller: true,
    onClick: (info, event) => clickEvents.push({info, event}),
    onHover: (info, event) => hoverEvents.push({info, event}),
    layers: [
      new ScatterplotLayer({
        data: [{position: [-122, 38]}, {position: [-122.05, 37.99]}],
        getPosition: d => d.position,
        getRadius: 100,
        getColor: [255, 0, 0],
        pickable: true,
        autoHighlight: true
      })
    ]
  },
  getTestCases: t => [
    {
      name: 'hover',
      events: [{type: 'mousemove', x: 400, y: 200}, {wait: 50}],
      onBeforeEvents,
      onAfterEvents: ({deck, layers}) => {
        t.is(hoverEvents.length, 1, 'onHover is called');
        t.is(hoverEvents[0].info.index, 0, 'object is picked');
        t.deepEqual(
          layers[0].state.model.getUniforms().picking_uSelectedColor,
          [1, 0, 0],
          'autoHighlight parameter is set'
        );
      }
    },
    {
      name: 'hover',
      events: [{type: 'click', x: 400, y: 200}, {wait: 350}],
      onBeforeEvents,
      onAfterEvents: ({deck}) => {
        t.is(clickEvents.length, 1, 'onClick is called');
        t.is(clickEvents[0].info.index, 0, 'object is picked');
      }
    }
  ]
};
