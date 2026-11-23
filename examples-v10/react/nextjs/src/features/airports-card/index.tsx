// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import 'server-only';
import {Suspense} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {AirportsCardServer} from './server';
import {AirportsCardLoading} from './loading';
import {AirportsCardError} from './error';

interface AirportsCardProps {
  id: string;
}

/**
 * Orchestrator component with Suspense and ErrorBoundary
 */
export function AirportsCard({id}: AirportsCardProps) {
  return (
    <ErrorBoundary FallbackComponent={AirportsCardError}>
      <Suspense fallback={<AirportsCardLoading />}>
        <AirportsCardServer id={id} />
      </Suspense>
    </ErrorBoundary>
  );
}
