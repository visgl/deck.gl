// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {Deck, OrthographicView} from '@deck.gl/core';
import {ArrowPathLayer} from '@deck.gl-community/arrow-layers';
import {ArrowDeck} from '../arrow-deck';
import {getDeckExampleProps, type DeckExampleDeviceOptions} from '../deck-example-device';
import {getArrowLayerTooltip} from '../arrow-layer-tooltip';
import {ArrowPathDataSource, type ArrowPathDataSourceUpdate} from './arrow-path-data-source';
import {MEASURE_SWEEP_DURATION} from '../../arrow/arrow-lines/arrow-line-data';

/** Creates the standalone or website-hosted Deck path-layer example. */
export function createArrowPathLayerDeck(
  parent?: HTMLDivElement,
  options: DeckExampleDeviceOptions = {}
) {
  let activeUpdate: ArrowPathDataSourceUpdate | null = null;
  let animationStartMilliseconds: number | null = null;

  const deck = new ArrowDeck({
    parent,
    ...getDeckExampleProps(options),
    views: new OrthographicView({id: 'main'}),
    initialViewState: {target: [0, 0], zoom: 8},
    controller: true,
    getTooltip: getArrowLayerTooltip,
    layers: [],
    onLoad: ({device}) => dataSource.initialize(device),
    onBeforeRender: ({deck}) => {
      const update = activeUpdate;
      if (update?.animate && update.temporalEnabled) {
        const timeMilliseconds = performance.now();
        animationStartMilliseconds ??= timeMilliseconds;
        const elapsedSeconds = (timeMilliseconds - animationStartMilliseconds) / 1000;
        const currentTime =
          (MEASURE_SWEEP_DURATION * 0.25 + elapsedSeconds * 0.24) % MEASURE_SWEEP_DURATION;
        setPathLayer(deck, update, currentTime);
      }
    },
    onFinalize: () => dataSource.finalize()
  });

  const dataSource = new ArrowPathDataSource({
    onDataUpdated: (update: ArrowPathDataSourceUpdate) => {
      activeUpdate = update;
      animationStartMilliseconds = null;
      setPathLayer(deck, update, update.currentTime);
    }
  });

  return deck;
}

function setPathLayer(
  deck: Deck<OrthographicView>,
  dataSource: ArrowPathDataSourceUpdate,
  currentTime: number | undefined
): void {
  deck.setProps({
    layers: [
      new ArrowPathLayer({
        id: 'arrow-paths',
        pickable: true,
        model: dataSource.model ?? 'auto',
        data: dataSource.asyncIterator,
        paths: 'paths',
        color: dataSource.colorColumn
          ? {source: 'colors', nullValue: [199, 219, 245, 235]}
          : [199, 219, 245, 235],
        width: dataSource.widthColumn ? {source: 'widths', nullValue: 0.0035} : 0.0035,
        currentTime,
        trailLength: dataSource.trailLength,
        temporalEnabled: dataSource.temporalEnabled,
        ...dataSource.layerProps
      })
    ]
  });
}
