// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import 'server-only';
import {Suspense} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {AirportsLayerServer} from './server';
import {AirportsLayerLoading} from './loading';
import {AirportsLayerError} from './error';

interface AirportsLayerProps {
  search?: string;
}

/**
 * Orchestrator component with Suspense and ErrorBoundary. A failed load shows the error until the
 * search changes.
 */
export function AirportsLayer({search}: AirportsLayerProps) {
  return (
    <ErrorBoundary FallbackComponent={AirportsLayerError} resetKeys={[search]}>
      <Suspense fallback={<AirportsLayerLoading />}>
        <AirportsLayerServer search={search} />
      </Suspense>
    </ErrorBoundary>
  );
}
