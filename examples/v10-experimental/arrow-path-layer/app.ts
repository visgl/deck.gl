// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {Deck, OrthographicView} from '@deck.gl/core';
import {ArrowPathLayer, type ArrowPathLayerProps} from '@deck.gl-community/arrow-layers';
import {ArrowDeck} from '../arrow-deck';
import {getDeckExampleProps, type DeckExampleDeviceOptions} from '../deck-example-device';
import {getArrowLayerTooltip} from '../arrow-layer-tooltip';
import {ArrowPathDataSource, type ArrowPathDataSourceUpdate} from './arrow-path-data-source';
import {MEASURE_SWEEP_DURATION} from '../shared/arrow/arrow-lines/arrow-line-data';

const PATH_COLOR: ArrowPathLayerProps['color'] = [199, 219, 245, 235];
const PATH_COLOR_COLUMN: ArrowPathLayerProps['color'] = {
  source: 'colors',
  nullValue: [199, 219, 245, 235]
};
const PATH_WIDTH_COLUMN: ArrowPathLayerProps['width'] = {source: 'widths', nullValue: 0.0035};

/** Creates the standalone or website-hosted Deck path-layer example. */
export function createArrowPathLayerDeck(
  parent?: HTMLDivElement,
  options: DeckExampleDeviceOptions = {}
) {
  let activeUpdate: ArrowPathDataSourceUpdate | null = null;
  let previousFrameMilliseconds: number | null = null;
  let currentTime = 0;

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
        const elapsedSeconds =
          (timeMilliseconds - (previousFrameMilliseconds ?? timeMilliseconds)) / 1000;
        previousFrameMilliseconds = timeMilliseconds;
        currentTime = (currentTime + elapsedSeconds * 0.24) % MEASURE_SWEEP_DURATION;
        setPathLayer(deck, update, currentTime);
      }
    },
    onFinalize: () => dataSource.finalize()
  });

  const dataSource = new ArrowPathDataSource({
    onDataUpdated: (update: ArrowPathDataSourceUpdate) => {
      if (update.asyncIterator !== activeUpdate?.asyncIterator) {
        currentTime = update.currentTime;
      }
      activeUpdate = update;
      previousFrameMilliseconds = null;
      setPathLayer(deck, update, currentTime);
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
        color: dataSource.colorColumn ? PATH_COLOR_COLUMN : PATH_COLOR,
        width: dataSource.widthColumn ? PATH_WIDTH_COLUMN : 0.0035,
        currentTime,
        trailLength: dataSource.trailLength,
        temporalEnabled: dataSource.temporalEnabled,
        ...dataSource.layerProps
      })
    ]
  });
}
