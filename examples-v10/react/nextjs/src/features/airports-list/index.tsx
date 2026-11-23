// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import 'server-only';
import {Suspense} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {AirportsListServer} from './server';
import {AirportsListLoading} from './loading';
import {AirportsListError} from './error';

interface AirportsListProps {
  search?: string;
}

/**
 * Orchestrator component with Suspense and ErrorBoundary
 */
export function AirportsList({search}: AirportsListProps) {
  return (
    <ErrorBoundary FallbackComponent={AirportsListError}>
      <Suspense fallback={<AirportsListLoading />}>
        <AirportsListServer search={search} />
      </Suspense>
    </ErrorBoundary>
  );
}
