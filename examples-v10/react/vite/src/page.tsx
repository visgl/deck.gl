// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Suspense} from 'react';
import {MapClient} from './modules/map';
import {AirportsLayer} from './features/airports-layer';
import {AirportsList} from './features/airports-list';
import {AirportsCard} from './features/airports-card';
import {SearchBox} from './components/search-box';
import {useAppStore} from './stores/app';

/**
 * Page composing all components with Suspense boundaries
 */
export function Page() {
  const selected = useAppStore(state => state.selected);

  return (
    <>
      <MapClient>
        <Suspense fallback={null}>
          <AirportsLayer />
        </Suspense>
      </MapClient>
      <Suspense fallback={<div>Loading airports...</div>}>
        <AirportsList />
      </Suspense>
      <SearchBox />
      {selected !== null && (
        <Suspense fallback={<div>Loading airport details...</div>}>
          <AirportsCard />
        </Suspense>
      )}
    </>
  );
}
