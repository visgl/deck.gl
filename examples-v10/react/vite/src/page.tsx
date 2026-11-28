// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Suspense, type ReactNode} from 'react';
import {MapClient} from './modules/map';
import {AirportsLayer} from './features/airports-layer';
import {AirportsList} from './features/airports-list';
import {AirportsCard} from './features/airports-card';
import {SearchBox} from './components/search-box';
import {ErrorBoundary} from './components/error-boundary';
import {useAppStore} from './stores/app';

/**
 * Shown in place of the list (on the left) or the card (on the right) while its query loads or
 * after it fails. It is positioned above the map, which fills the page.
 */
function Notice({side, children}: {side: 'left' | 'right'; children: ReactNode}) {
  return <div style={{[side]: 20, position: 'absolute', top: 20, zIndex: 1}}>{children}</div>;
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
      <ErrorBoundary
        resetKey={search}
        fallback={error => <Notice side="left">{error.message}</Notice>}
      >
        <Suspense fallback={<Notice side="left">Loading airports...</Notice>}>
          <AirportsList />
        </Suspense>
      </ErrorBoundary>
      <SearchBox />
      {selected !== null && (
        <ErrorBoundary
          resetKey={selected}
          fallback={error => <Notice side="right">{error.message}</Notice>}
        >
          <Suspense fallback={<Notice side="right">Loading airport details...</Notice>}>
            <AirportsCard />
          </Suspense>
        </ErrorBoundary>
      )}
    </>
  );
}
