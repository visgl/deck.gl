// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {useSuspenseQuery} from '@tanstack/react-query';
import {fetchAirports} from '../data-access/airports/client';
import type {Airport} from '../data-access/airports/types';

/**
 * Hook to fetch airports with TanStack Query Suspense
 */
export function useAirports(search: string): Airport[] {
  const {data} = useSuspenseQuery({
    queryFn: () => fetchAirports(search),
    queryKey: ['airports', search]
  });

  return data;
}
