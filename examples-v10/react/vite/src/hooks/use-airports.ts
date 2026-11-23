// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {useDeferredValue} from 'react';
import {useSuspenseQuery} from '@tanstack/react-query';
import {fetchAirports} from '../data-access/airports/client';
import type {Airport} from '../data-access/airports/types';

/**
 * Hook to fetch airports with TanStack Query Suspense. The search comes from a zustand store,
 * whose updates React can't defer with a transition, so the query uses a deferred copy: while new
 * results load, the list and the layer keep showing the previous ones instead of a fallback.
 */
export function useAirports(search: string): Airport[] {
  const deferredSearch = useDeferredValue(search);
  const {data} = useSuspenseQuery({
    queryFn: () => fetchAirports(deferredSearch),
    queryKey: ['airports', deferredSearch]
  });

  return data;
}
