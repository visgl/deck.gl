import React, {createContext, type ReactNode} from 'react';
import type {UseBoundStore} from 'zustand';
import type {Store} from './store';

export type ContextStore = UseBoundStore<Store>;

export const context = createContext<ContextStore | null>(null);

type ProviderProps = {
  store: ContextStore;
  children: ReactNode;
};

export function Provider({store, children}: ProviderProps) {
  return <context.Provider value={store}>{children}</context.Provider>;
}
