// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect} from 'vitest';
import {MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import type {InteractionTestCase} from '@deck.gl/test-utils';

const clickEvents: any[] = [];
const hoverEvents: any[] = [];

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
    onClick: (info: any, event: any) => clickEvents.push({info, event}),
    onHover: (info: any, event: any) => hoverEvents.push({info, event}),
    layers: [
      new ScatterplotLayer({
        data: [{position: [-122, 38]}, {position: [-122.05, 37.99]}],
        getPosition: (d: any) => d.position,
        getRadius: 100,
        getColor: [255, 0, 0],
        pickable: true,
        autoHighlight: true
      })
    ]
  },
  getTestCases: (): InteractionTestCase[] => [
    {
      name: 'hover',
      events: [{type: 'mousemove', x: 400, y: 200}, {wait: 50}],
      onBeforeEvents,
      onAfterEvents: ({layers}) => {
        expect(hoverEvents.length, 'onHover is called').toBe(1);
        expect(hoverEvents[0].info.index, 'object is picked').toBe(0);
        const uniforms = (layers[0] as any).state.model.shaderInputs.getUniformValues();
        expect(uniforms.picking.highlightedObjectColor, 'autoHighlight parameter is set').toEqual([
          1, 0, 0
        ]);
      }
    }
    // TODO(felixpalmer/ibgreen): Temporarily disabled during luma 9.2 upgrade
    // {
    //   name: 'click',
    //   events: [{type: 'click', x: 400, y: 200}, {wait: 350}],
    //   onBeforeEvents,
    //   onAfterEvents: ({deck}) => {
    //     expect(clickEvents.length, 'onClick is called').toBe(1);
    //     expect(clickEvents[0].info.index, 'object is picked').toBe(0);
    //   }
    // }
  ]
};
