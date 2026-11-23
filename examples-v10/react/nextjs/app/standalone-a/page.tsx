// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {NuqsAdapter} from 'nuqs/adapters/next/app';
import {selectedParser, searchParser} from '@/utils/params';
import {MapClient} from '@/modules/map-standalone';
import {AirportsLayer} from '@/features/airports-layer';
import {AirportsList} from '@/features/airports-list';
import {AirportsCard} from '@/features/airports-card';
import {SearchBox} from '@/components/search-box';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Home page composing all components
 */
export default async function Page({searchParams}: PageProps) {
  const params = await searchParams;

  // Parse URL params
  const selected = selectedParser.parseServerSide(params.selected);
  const search = searchParser.parseServerSide(params.q);

  return (
    <NuqsAdapter>
      <MapClient>
        <AirportsLayer search={search ?? undefined} />
      </MapClient>
      <AirportsList search={search ?? undefined} />
      <SearchBox />
      {selected && <AirportsCard id={selected} />}
    </NuqsAdapter>
  );
}
