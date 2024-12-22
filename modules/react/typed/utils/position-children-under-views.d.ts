import * as React from 'react';
import type {Deck, DeckProps, Viewport} from '@deck.gl/core';
import type {EventManager} from 'mjolnir.js';
export declare type DeckGLContextValue = {
  viewport: Viewport;
  container: HTMLElement;
  eventManager: EventManager;
  onViewStateChange: DeckProps['onViewStateChange'];
};
export default function positionChildrenUnderViews({
  children,
  deck,
  ContextProvider
}: {
  children: React.ReactNode[];
  deck?: Deck;
  ContextProvider?: React.Context<DeckGLContextValue>['Provider'];
}): React.ReactNode[];
// # sourceMappingURL=position-children-under-views.d.ts.map
