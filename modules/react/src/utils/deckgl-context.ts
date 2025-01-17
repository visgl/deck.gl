import {createContext} from 'react';
import type {EventManager} from 'mjolnir.js';
import type {Deck, DeckProps, Viewport, Widget} from '@deck.gl/core';

export type DeckGLContextValue = {
  viewport: Viewport;
  container: HTMLElement;
  eventManager: EventManager;
  onViewStateChange: DeckProps['onViewStateChange'];
  deck?: Deck<any>;
  widgets?: Widget[];
};

// @ts-ignore
export const DeckGlContext = createContext<DeckGLContextValue>();
