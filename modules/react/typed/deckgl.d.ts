import * as React from 'react';
import {Deck} from '@deck.gl/core';
import type {DeckGLContextValue} from './utils/position-children-under-views';
import type {DeckProps} from '@deck.gl/core';
/** DeckGL React component props */
export declare type DeckGLProps = Omit<
  DeckProps,
  'width' | 'height' | 'gl' | 'parent' | 'canvas' | '_customRender'
> & {
  Deck?: typeof Deck;
  width?: string | number;
  height?: string | number;
  children?: React.ReactNode;
  ContextProvider?: React.Context<DeckGLContextValue>['Provider'];
};
export declare type DeckGLRef = {
  deck?: Deck;
  pickObject: Deck['pickObject'];
  pickObjects: Deck['pickObjects'];
  pickMultipleObjects: Deck['pickMultipleObjects'];
};
declare const DeckGL: React.ForwardRefExoticComponent<
  Omit<DeckProps, 'width' | 'height' | 'canvas' | 'gl' | 'parent' | '_customRender'> & {
    Deck?: typeof Deck;
    width?: string | number;
    height?: string | number;
    children?: React.ReactNode;
    ContextProvider?: React.Context<DeckGLContextValue>['Provider'];
  } & React.RefAttributes<DeckGLRef>
>;
export default DeckGL;
// # sourceMappingURL=deckgl.d.ts.map
