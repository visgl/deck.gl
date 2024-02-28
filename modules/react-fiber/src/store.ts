import {create, type StoreApi} from 'zustand';
import type {Deck} from '@deck.gl/core';

export type State = {
  webgl: WebGL2RenderingContext;
  setWebgl: (instance: WebGL2RenderingContext) => void;
  deckgl: Deck;
  setDeckgl: (instance: Deck) => void;
};

export type Store = StoreApi<State>;

// NOTE: this store is primarily used for the fiber nodes

export const useStore = create<State>()(set => ({
  webgl: undefined!,
  setWebgl: instance => {
    set({webgl: instance});
  },
  deckgl: undefined!,
  setDeckgl: instance => {
    set({deckgl: instance});
  }
}));

export const selectors = {
  webgl: s => s.webgl,
  setWebgl: s => s.setWebgl,
  deckgl: s => s.deckgl,
  setDeckgl: s => s.setDeckgl
} satisfies Record<string, (state: State) => State[keyof State]>;
