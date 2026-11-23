// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Suspense} from 'react';
import {MapClient} from './modules/map';
import {AirportsLayer} from './features/airports-layer';
import {AirportsList} from './features/airports-list';
import {AirportsCard} from './features/airports-card';
import {SearchBox} from './components/search-box';
import {ErrorBoundary} from './components/error-boundary';
import {useAppStore} from './stores/app';

/** Shown in place of the list or the card when the airports query fails. */
function QueryError({error}: {error: Error}) {
  return <div style={{left: 20, position: 'absolute', top: 20, zIndex: 1}}>{error.message}</div>;
}

/**
 * Page composing all components with Suspense and error boundaries. Each error boundary is keyed
 * by the search, so a new search tries again after a failed query.
 */
export function Page() {
  const selected = useAppStore(state => state.selected);
  const search = useAppStore(state => state.search);

  return (
    <>
      <MapClient>
        <ErrorBoundary key={search} fallback={() => null}>
          <Suspense fallback={null}>
            <AirportsLayer />
          </Suspense>
        </ErrorBoundary>
      </MapClient>
      <ErrorBoundary key={search} fallback={error => <QueryError error={error} />}>
        <Suspense fallback={<div>Loading airports...</div>}>
          <AirportsList />
        </Suspense>
      </ErrorBoundary>
      <SearchBox />
      {selected !== null && (
        <ErrorBoundary key={selected} fallback={error => <QueryError error={error} />}>
          <Suspense fallback={<div>Loading airport details...</div>}>
            <AirportsCard />
          </Suspense>
        </ErrorBoundary>
      )}
    </>
  );
}
