// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {create} from 'zustand';

interface AppState {
  selected: number | null;
  search: string;
  hovered: number | null;
  setSelected: (id: number | null) => void;
  setSearch: (query: string) => void;
  setHovered: (id: number | null) => void;
}

/**
 * Zustand store with manual URL synchronization. The URL is replaced rather than pushed, so
 * typing a search doesn't add a history entry per keystroke.
 * - selected and search are synced to URL
 * - hovered is transient (not persisted)
 */
export const useAppStore = create<AppState>(set => {
  // Initialize from URL on store creation
  const params = new URLSearchParams(window.location.search);
  // A value that isn't a number, such as `?selected=abc`, selects nothing.
  const initialSelected = Number.parseInt(params.get('selected') ?? '', 10);
  const initialSearch = params.get('q') ?? '';

  return {
    hovered: null,
    search: initialSearch,
    selected: Number.isFinite(initialSelected) ? initialSelected : null,

    setHovered: id => set({hovered: id}),

    setSearch: query => {
      set({search: query});

      // Sync to URL
      const urlParams = new URLSearchParams(window.location.search);
      if (query === '') {
        urlParams.delete('q');
      } else {
        urlParams.set('q', query);
      }

      const newUrl = urlParams.toString()
        ? `${window.location.pathname}?${urlParams.toString()}`
        : window.location.pathname;

      window.history.replaceState({}, '', newUrl);
    },

    setSelected: id => {
      set({selected: id});

      // Sync to URL
      const urlParams = new URLSearchParams(window.location.search);
      if (id === null) {
        urlParams.delete('selected');
      } else {
        urlParams.set('selected', String(id));
      }

      const newUrl = urlParams.toString()
        ? `${window.location.pathname}?${urlParams.toString()}`
        : window.location.pathname;

      window.history.replaceState({}, '', newUrl);
    }
  };
});
