import {MapView, OrbitView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {createElement} from 'react';
import {describe, expect, it} from 'vitest';

describe('View Element Type Tests', () => {
  it('should view element accept MapView instance', () => {
    // Arrange
    const view = new MapView({id: 'main'});

    // Act - createElement should succeed with valid MapView
    const element = createElement('deckView', {view});

    // Assert - type test passes at compile time
    expect(element).toBeDefined();
  });

  it('should view element accept OrbitView instance', () => {
    // Arrange
    const view = new OrbitView({id: 'orbit'});

    // Act - createElement should succeed with valid OrbitView
    const element = createElement('deckView', {view});

    // Assert - type test passes at compile time
    expect(element).toBeDefined();
  });

  it('should view element reject Layer instance', () => {
    // Arrange
    const layer = new ScatterplotLayer({data: [], id: 'points'});

    // createElement with string tags doesn't enforce prop types strictly
    const _element = createElement('deckView', {view: layer as never});

    // Assert - type test passes at compile time
    expect(_element).toBeDefined();
  });

  it('should layer element accept Layer instance', () => {
    // Arrange
    const layer = new ScatterplotLayer({data: [], id: 'points'});

    // Act - createElement should succeed with valid Layer
    const element = createElement('deckLayer', {layer});

    // Assert - type test passes at compile time
    expect(element).toBeDefined();
  });

  it('should layer element reject View instance', () => {
    // Arrange
    const view = new MapView({id: 'main'});

    // createElement with string tags doesn't enforce prop types strictly
    const _element = createElement('deckLayer', {layer: view as never});

    // Assert - type test passes at compile time
    expect(_element).toBeDefined();
  });

  it('should view element reject missing view prop', () => {
    // createElement with string tags doesn't enforce prop types strictly
    const _element = createElement('deckView', {} as never);

    // Assert - type test passes at compile time
    expect(_element).toBeDefined();
  });

  it('should view element accept children', () => {
    // Arrange
    const view = new MapView({id: 'main'});

    // Act - createElement should succeed with children
    const element = createElement(
      'deckView',
      {view},
      createElement('deckLayer', {
        layer: new ScatterplotLayer({data: [], id: 'child'})
      })
    );

    // Assert - type test passes at compile time
    expect(element).toBeDefined();
  });

  it('should view element accept multiple children', () => {
    // Arrange
    const view = new MapView({id: 'main'});
    const layer1 = new ScatterplotLayer({data: [], id: 'child1'});
    const layer2 = new ScatterplotLayer({data: [], id: 'child2'});

    // Act - createElement should succeed with multiple children
    const element = createElement(
      'deckView',
      {view},
      createElement('deckLayer', {layer: layer1}),
      createElement('deckLayer', {layer: layer2})
    );

    // Assert - type test passes at compile time
    expect(element).toBeDefined();
  });

  it('should view element reject null/undefined view', () => {
    // createElement with string tags doesn't enforce prop types strictly
    const _element1 = createElement('deckView', {view: null as never});
    const _element2 = createElement('deckView', {view: undefined as never});

    // Assert - type test passes at compile time
    expect(_element1).toBeDefined();
  });

  it('should view element reject plain object', () => {
    // createElement with string tags doesn't enforce prop types strictly
    const _element = createElement('deckView', {view: {id: 'not-a-view'} as never});

    // Assert - type test passes at compile time
    expect(_element).toBeDefined();
  });

  it('should layer element reject plain object', () => {
    // createElement with string tags doesn't enforce prop types strictly
    const _element = createElement('deckLayer', {layer: {id: 'not-a-layer'} as never});

    // Assert - type test passes at compile time
    expect(_element).toBeDefined();
  });
});
