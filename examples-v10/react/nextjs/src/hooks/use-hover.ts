// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

'use client';

import {useHoverStore} from '@/stores/hover';

/**
 * Hook for managing hover state (transient, not in URL)
 */
export function useHover() {
  const hovered = useHoverStore(state => state.hovered);
  const setHovered = useHoverStore(state => state.setHovered);
  return [hovered, setHovered] as const;
}
