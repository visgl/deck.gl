// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

'use client';

import {useQueryState} from 'nuqs';
import {searchParser} from '@/utils/params';

/**
 * Hook for managing search query state via URL
 */
export function useSearch() {
  return useQueryState('q', searchParser.withOptions({shallow: false}));
}
