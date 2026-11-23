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

/** Shown in place of the list (on the left) or the card (on the right) when its query fails. */
function QueryError({error, side}: {error: Error; side: 'left' | 'right'}) {
  return <div style={{[side]: 20, position: 'absolute', top: 20, zIndex: 1}}>{error.message}</div>;
}

/**
 * Page composing all components with Suspense and error boundaries. Each error boundary resets
 * when the search or the selection changes, so a new one tries again after a failed query.
 */
export function Page() {
  const selected = useAppStore(state => state.selected);
  const search = useAppStore(state => state.search);

  return (
    <>
      <MapClient>
        <ErrorBoundary resetKey={search} fallback={() => null}>
          <Suspense fallback={null}>
            <AirportsLayer />
          </Suspense>
        </ErrorBoundary>
      </MapClient>
      <ErrorBoundary resetKey={search} fallback={error => <QueryError error={error} side="left" />}>
        <Suspense fallback={<div>Loading airports...</div>}>
          <AirportsList />
        </Suspense>
      </ErrorBoundary>
      <SearchBox />
      {selected !== null && (
        <ErrorBoundary
          resetKey={selected}
          fallback={error => <QueryError error={error} side="right" />}
        >
          <Suspense fallback={<div>Loading airport details...</div>}>
            <AirportsCard />
          </Suspense>
        </ErrorBoundary>
      )}
    </>
  );
}
