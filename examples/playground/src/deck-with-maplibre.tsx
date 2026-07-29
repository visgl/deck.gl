// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {DeckGL, type DeckGLProps} from '@deck.gl/react';
import {View} from '@deck.gl/core';
import {Map, type MapProps} from 'react-map-gl/maplibre';

export type DeckWithMapLibreProps = Omit<DeckGLProps, 'initialViewState' | 'views'> & {
  initialViewState: Record<string, any>;
  mapStyle: MapProps['mapStyle'];
  views?: any;
};

export default function DeckWithMapLibre(props: DeckWithMapLibreProps) {
  const {views = []} = props;

  const maps: React.ReactNode[] = [];
  for (const view of views) {
    if (view.props.map || view.props.mapStyle) {
      maps.push(
        <View id={view.props.id} key={view.props.id}>
          <Map reuseMaps mapStyle={view.props.mapStyle} />
        </View>
      );
    }
  }

  return (
    <DeckGL id="json-deck" {...props}>
      {maps}
    </DeckGL>
  );
}
