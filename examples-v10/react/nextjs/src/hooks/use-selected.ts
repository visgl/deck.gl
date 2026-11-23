// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

'use client';

import {useQueryState} from 'nuqs';
import {selectedParser} from '@/utils/params';

/**
 * Hook for managing selected airport state via URL
 * Returns [selected | null, setSelected]
 */
export function useSelected() {
  const [selected, setSelected] = useQueryState(
    'selected',
    selectedParser.withOptions({shallow: false})
  );

  // Convert empty string to null for easier checking
  const normalizedSelected = selected === '' ? null : selected;

  const setNormalizedSelected = (id: string | null) => {
    setSelected(id === null ? '' : id);
  };

  return [normalizedSelected, setNormalizedSelected] as const;
}
