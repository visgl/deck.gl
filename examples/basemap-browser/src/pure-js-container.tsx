// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useEffect, useRef} from 'react';
import type {BasemapExample} from './types';
import * as pureJSExamples from './examples-pure-js';

type PureJSContainerProps = {
  example: BasemapExample;
  interleaved: boolean;
};

/**
 * Container for Pure JS examples - completely isolated from React.
 * React creates the container div but never updates it.
 * The Pure JS code has full control and React never touches it again.
 */
export default function PureJSContainer({example, interleaved}: PureJSContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return () => {
        // No-op cleanup
      };
    }

    const container = containerRef.current;
    const {mapType, getLayers, initialViewState, mapStyle, globe} = example;

    // Mount the appropriate Pure JS implementation
    let cleanup: (() => void) | undefined;

    switch (mapType) {
      case 'google-maps':
        cleanup = pureJSExamples.googleMaps.mount(
          container,
          getLayers,
          initialViewState,
          interleaved
        );
        break;

      case 'mapbox':
        cleanup = pureJSExamples.mapbox.mount(
          container,
          getLayers,
          initialViewState,
          mapStyle!,
          interleaved
        );
        break;

      case 'maplibre':
        cleanup = pureJSExamples.maplibre.mount(
          container,
          getLayers,
          initialViewState,
          mapStyle!,
          interleaved,
          globe
        );
        break;

      default:
        // No-op for unknown map types
        break;
    }

    cleanupRef.current = cleanup || null;

    // Cleanup when example changes or component unmounts
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [example, interleaved]);

  return <div ref={containerRef} style={{width: '100%', height: '100%'}} />;
}
