// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import {test, expect, describe, vi} from 'vitest';
import {Deck} from '@deck.gl/core';
import {renderWidget} from '@deck.gl/jupyter-widget/widget';

/** Minimal stand-in for anywidget's AnyModel */
class MockModel {
  state: Record<string, unknown>;
  listeners: Record<string, Array<() => void>> = {};
  sent: unknown[] = [];

  constructor(state: Record<string, unknown>) {
    this.state = {
      width: '100%',
      height: 300,
      json_input: '',
      data_buffer: null,
      tooltip: true,
      mapbox_key: '',
      google_maps_key: '',
      custom_libraries: null,
      configuration: null,
      show_error: false,
      ...state
    };
  }

  get(key: string) {
    return this.state[key];
  }

  set(key: string, value: unknown) {
    this.state[key] = value;
  }

  on(event: string, callback: () => void) {
    (this.listeners[event] = this.listeners[event] || []).push(callback);
  }

  off(event: string, callback: () => void) {
    this.listeners[event] = (this.listeners[event] || []).filter(cb => cb !== callback);
  }

  send(content: unknown) {
    this.sent.push(content);
  }

  save_changes() {}

  trigger(event: string) {
    for (const callback of this.listeners[event] || []) {
      callback();
    }
  }
}

const LAYER_JSON = {
  layers: [
    {
      '@@type': 'ScatterplotLayer',
      id: 'layer-id',
      data: [{position: [0, 0]}],
      getPosition: '@@=position'
    }
  ],
  initialViewState: {longitude: 0, latitude: 0, zoom: 1}
};

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

function render(model: MockModel) {
  const el = document.createElement('div');
  document.body.appendChild(el);
  const controller = new AbortController();
  const deck = renderWidget({model, el, signal: controller.signal});
  return {el, deck, controller};
}

describe('jupyter-widget: anywidget entry', () => {
  test('render creates a deck inside the element', () => {
    const model = new MockModel({json_input: JSON.stringify(LAYER_JSON)});
    const {el, deck, controller} = render(model);
    try {
      expect(deck).toBeInstanceOf(Deck);
      expect(el.children).toHaveLength(1);
      const canvas = el.querySelector('canvas');
      expect(canvas).toBeTruthy();
      expect(canvas.parentElement.style.height).toBe('300px');
      expect(canvas.parentElement.style.width).toBe('100%');
    } finally {
      controller.abort();
      el.remove();
    }
  });

  test('json_input changes are applied after a microtask', async () => {
    const model = new MockModel({json_input: JSON.stringify({layers: []})});
    const {el, deck, controller} = render(model);
    try {
      expect(deck.props.layers).toHaveLength(0);
      model.set('json_input', JSON.stringify(LAYER_JSON));
      model.trigger('change:json_input');
      await flush();
      expect(deck.props.layers).toHaveLength(1);
      expect(deck.props.layers[0].id).toBe('layer-id');
    } finally {
      controller.abort();
      el.remove();
    }
  });

  test('json_input and data_buffer changes coalesce into one setProps with binary data', async () => {
    const model = new MockModel({json_input: JSON.stringify({layers: []})});
    const {el, deck, controller} = render(model);
    try {
      const setProps = vi.spyOn(deck, 'setProps');
      const buffer = new ArrayBuffer(8 + 16);
      new Float32Array(buffer, 8, 4).set([1, 2, 3, 4]);
      model.set(
        'json_input',
        JSON.stringify({layers: [{'@@type': 'ScatterplotLayer', id: 'layer-id'}]})
      );
      model.set('data_buffer', {
        'layer-id': {
          length: 2,
          attributes: {getPosition: {dtype: 'float32', size: 2, value: new DataView(buffer, 8, 16)}}
        }
      });
      model.trigger('change:json_input');
      model.trigger('change:data_buffer');
      await flush();
      expect(setProps).toHaveBeenCalledTimes(1);
      const {value} = deck.props.layers[0].props.data.attributes.getPosition;
      expect(value).toBeInstanceOf(Float32Array);
      expect(Array.from(value)).toEqual([1, 2, 3, 4]);
    } finally {
      controller.abort();
      el.remove();
    }
  });

  test('events are sent to Python as JSON strings', () => {
    const model = new MockModel({json_input: JSON.stringify(LAYER_JSON)});
    const {el, deck, controller} = render(model);
    try {
      const layer = deck.props.layers[0];
      deck.props.onClick({index: 0, picked: true, layer, object: {a: 1}, x: 1, y: 2});
      expect(model.sent).toHaveLength(1);
      expect(typeof model.sent[0]).toBe('string');
      const click = JSON.parse(model.sent[0] as string);
      expect(click.type).toBe('deck-click-event');
      expect(click.data.layer).toBe('layer-id');
      expect(click.data.object).toEqual({a: 1});

      deck.props.onHover({index: -1, picked: false});
      expect(model.sent, 'background hover is not forwarded').toHaveLength(1);

      deck.props.onViewStateChange({
        viewState: {longitude: 0, latitude: 0, zoom: 1, width: 100, height: 100},
        interactionState: {},
        oldViewState: {}
      });
      const viewStateEvent = JSON.parse(model.sent[1] as string);
      expect(viewStateEvent.type).toBe('deck-view-state-change-event');
      expect(viewStateEvent.data.nw).toHaveLength(2);
      expect(viewStateEvent.data.se).toHaveLength(2);
    } finally {
      controller.abort();
      el.remove();
    }
  });

  test('abort finalizes the deck and stops applying changes', async () => {
    const model = new MockModel({json_input: JSON.stringify(LAYER_JSON)});
    const {el, deck, controller} = render(model);
    const setProps = vi.spyOn(deck, 'setProps');
    controller.abort();
    expect(el.children).toHaveLength(0);
    model.set('json_input', JSON.stringify({layers: []}));
    model.trigger('change:json_input');
    await flush();
    expect(setProps).not.toHaveBeenCalled();
    el.remove();
  });
});
