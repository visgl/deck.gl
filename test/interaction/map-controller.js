import {MapView} from '@deck.gl/core';
// import {toLowPrecision} from '@deck.gl/test-utils';

function getViewport(deck) {
  return deck.getViewports()[0];
}
const onBeforeEvents = ({deck}) => ({viewport: getViewport(deck)});

export default {
  title: 'MapController',
  props: {
    width: 800,
    height: 400,
    views: new MapView(),
    initialViewState: {
      longitude: -122,
      latitude: 38,
      zoom: 10,
      pitch: 30,
      bearing: -45
    },
    controller: true
  },
  getTestCases: t => [
    {
      name: 'pan',
      events: [{type: 'drag', startX: 400, startY: 100, endX: 300, endY: 150, steps: 3}],
      onBeforeEvents,
      onAfterEvents: ({deck, context}) => {
        const oldViewport = context.viewport;
        const newViewport = getViewport(deck);
        t.ok(
          newViewport.longitude > oldViewport.longitude &&
            newViewport.latitude > oldViewport.latitude,
          'map moved'
        );
        t.ok(
          newViewport.zoom === oldViewport.zoom &&
            newViewport.pitch === oldViewport.pitch &&
            newViewport.bearing === oldViewport.bearing,
          'map did not zoom or rotate'
        );
      }
    },
    {
      name: 'rotate',
      events: [
        {type: 'drag', startX: 400, startY: 100, endX: 300, endY: 150, steps: 3, shiftKey: true}
      ],
      onBeforeEvents,
      onAfterEvents: ({deck, context}) => {
        const oldViewport = context.viewport;
        const newViewport = getViewport(deck);
        t.ok(
          newViewport.longitude === oldViewport.longitude &&
            newViewport.latitude === oldViewport.latitude &&
            newViewport.zoom === oldViewport.zoom,
          'map did not move'
        );
        t.ok(
          newViewport.pitch < oldViewport.pitch && newViewport.bearing < oldViewport.bearing,
          'map rotated'
        );
      }
    },
    {
      name: 'dblclick',
      events: [
        {type: 'click', x: 200, y: 100},
        {wait: 50},
        {type: 'click', x: 200, y: 100},
        {wait: 300}
      ],
      onBeforeEvents,
      onAfterEvents: ({deck, context}) => {
        const oldViewport = context.viewport;
        const newViewport = getViewport(deck);
        t.ok(newViewport.zoom > oldViewport.zoom, 'map zoomed in');
      }
    },
    {
      name: 'shift-dblclick',
      events: [
        {type: 'click', x: 200, y: 100, shiftKey: true},
        {wait: 50},
        {type: 'click', x: 200, y: 100, shiftKey: true},
        {wait: 300}
      ],
      onBeforeEvents,
      onAfterEvents: ({deck, context}) => {
        const oldViewport = context.viewport;
        const newViewport = getViewport(deck);
        t.ok(newViewport.zoom < oldViewport.zoom, 'map zoomed out');
      }
    },
    {
      name: 'keyboard navigation#left',
      events: [{type: 'keypress', key: 'ArrowLeft'}, {wait: 300}],
      onBeforeEvents,
      onAfterEvents: ({deck, context}) => {
        const oldViewport = context.viewport;
        const newViewport = getViewport(deck);
        t.ok(newViewport.longitude < oldViewport.longitude, 'map moved');
      }
    },
    {
      name: 'keyboard navigation#up',
      events: [{type: 'keypress', key: 'ArrowUp'}, {wait: 300}],
      onBeforeEvents,
      onAfterEvents: ({deck, context}) => {
        const oldViewport = context.viewport;
        const newViewport = getViewport(deck);
        t.ok(newViewport.latitude > oldViewport.latitude, 'map moved');
      }
    },
    {
      name: 'keyboard navigation#shift-left',
      events: [{type: 'keypress', key: 'ArrowLeft', shiftKey: true}, {wait: 300}],
      onBeforeEvents,
      onAfterEvents: ({deck, context}) => {
        const oldViewport = context.viewport;
        const newViewport = getViewport(deck);
        t.ok(newViewport.bearing < oldViewport.bearing, 'map rotated');
      }
    },
    {
      name: 'keyboard navigation#shift-up',
      events: [{type: 'keypress', key: 'ArrowUp', shiftKey: true}, {wait: 300}],
      onBeforeEvents,
      onAfterEvents: ({deck, context}) => {
        const oldViewport = context.viewport;
        const newViewport = getViewport(deck);
        t.ok(newViewport.pitch > oldViewport.pitch, 'map rotated');
      }
    },
    {
      name: 'keyboard navigation#minus',
      events: [{type: 'keypress', key: 'Minus'}, {wait: 300}],
      onBeforeEvents,
      onAfterEvents: ({deck, context}) => {
        const oldViewport = context.viewport;
        const newViewport = getViewport(deck);
        t.ok(newViewport.zoom < oldViewport.zoom, 'map zoomed');
      }
    },
    {
      name: 'keyboard navigation#shift-plus',
      events: [{type: 'keypress', key: 'Equal', shiftKey: true}, {wait: 300}],
      onBeforeEvents,
      onAfterEvents: ({deck, context}) => {
        const oldViewport = context.viewport;
        const newViewport = getViewport(deck);
        t.ok(newViewport.zoom > oldViewport.zoom, 'map zoomed');
      }
    }
  ]
};
