// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

'use client';

import type {ReactNode} from 'react';
import {DeckGL} from '@deck.gl/react';
import {useSelected} from '@/hooks/use-selected';
import {INITIAL_VIEW_STATE, PARAMETERS} from './constants';
import {DeckProps} from '@deck.gl/core';

interface MapClientProps extends DeckProps {
  children?: ReactNode;
}

/**
 * Map component with deck.gl + Maplibre integration
 */
export function MapClient({children, ...etc}: MapClientProps) {
  const [, setSelected] = useSelected();

  const handleClick = (pickInfo: {picked?: boolean}) => {
    if (!pickInfo.picked) {
      setSelected(null);
    }
  };

  return (
    <DeckGL
      controller
      initialViewState={INITIAL_VIEW_STATE}
      parameters={PARAMETERS}
      onClick={handleClick}
      {...etc}
    >
      {children}
    </DeckGL>
  );
}
