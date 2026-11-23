// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {create} from 'zustand';

interface HoverState {
  hovered: string | null;
  setHovered: (id: string | null) => void;
}

/**
 * Zustand store for transient hover state (not persisted to URL)
 */
export const useHoverStore = create<HoverState>(set => ({
  hovered: null,
  setHovered: id => set({hovered: id})
}));
