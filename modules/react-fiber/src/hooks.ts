import {useContext} from 'react';
import {context} from './context';
import type {State} from './store';

export function useStore() {
  const store = useContext(context);

  if (!store) {
    throw new Error('Hooks can only be used within the DeckGL component!');
  }

  return store;
}

export function useDeckgl<T = State>(
  selector: (state: State) => T = state => state as unknown as T,
  equalityFn?: <T>(state: T, newState: T) => boolean
) {
  return useStore()(selector, equalityFn);
}
