// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {OrthographicView, type OrthographicViewState} from '@deck.gl/core';
import {ArrowPolygonLayer, type ArrowLayerPickingInfo} from '@deck.gl-community/arrow-layers';
import {
  ArrowPolygonDataSource,
  type ArrowPolygonDataSourceUpdate
} from '../../arrow/arrow-polygons/arrow-polygon-data-source';
import {ArrowDeck} from '../arrow-deck';
import {getDeckExampleProps, type DeckExampleDeviceOptions} from '../deck-example-device';
import {getArrowLayerTooltip} from '../arrow-layer-tooltip';

/** Creates the standalone or website-hosted Deck polygon-layer example. */
export function createArrowPolygonLayerDeck(
  parent?: HTMLDivElement,
  options: DeckExampleDeviceOptions = {}
) {
  let activeUpdate: ArrowPolygonDataSourceUpdate | null = null;
  let animationSeconds = 0;
  let camera: OrthographicViewState = {target: [0, 0, 0], zoom: 9};
  let previousTarget: [number, number] = [0, 0];
  let lastAnimationMilliseconds: number | null = null;

  const deck = new ArrowDeck<OrthographicView>({
    parent,
    ...getDeckExampleProps(options),
    views: new OrthographicView({id: 'main', controller: true}),
    initialViewState: camera,
    onViewStateChange: ({viewState}) => {
      camera = viewState;
      deck.setProps({viewState: camera});
    },
    getTooltip: getArrowLayerTooltip,
    layers: [],
    onLoad: ({device}) => dataSource.initialize(device),
    onBeforeRender: ({deck}) => {
      const timeMilliseconds = performance.now();
      if (lastAnimationMilliseconds !== null) {
        animationSeconds += Math.max(timeMilliseconds - lastAnimationMilliseconds, 0) / 1000;
      }
      lastAnimationMilliseconds = timeMilliseconds;
      if (activeUpdate) {
        const target = getPolygonScrollCenter(activeUpdate, animationSeconds);
        camera = {
          ...camera,
          target: [
            camera.target![0] + (target[0] - previousTarget[0]),
            camera.target![1] + (target[1] - previousTarget[1]),
            camera.target![2] ?? 0
          ]
        };
        previousTarget = target;
        deck.setProps({viewState: camera});
      }
    },
    onFinalize: () => dataSource.finalize()
  });
  const dataSource = new ArrowPolygonDataSource({
    onDataUpdated: update => {
      activeUpdate = update;
      animationSeconds = 0;
      lastAnimationMilliseconds = null;
      previousTarget = update.viewState.startCenter;
      camera = {target: [...previousTarget, 0], zoom: 9};
      deck.setProps({
        viewState: camera,
        layers: [makeArrowPolygonLayer(update, dataSource)]
      });
    },
    onRendererPropsUpdated: rendererProps => {
      if (activeUpdate) {
        activeUpdate = {...activeUpdate, ...rendererProps};
        deck.setProps({layers: [makeArrowPolygonLayer(activeUpdate, dataSource)]});
      }
    },
    preferStorage: true,
    inputMode: 'stream',
    showInputModeControl: false
  });
  return deck;
}

function getPolygonScrollCenter(
  update: ArrowPolygonDataSourceUpdate,
  animationSeconds: number
): [number, number] {
  const {startCenter, endCenter, scrollDurationSeconds} = update.viewState;
  const cycleDurationSeconds = scrollDurationSeconds * 2;
  const cyclePosition =
    cycleDurationSeconds > 0 ? (animationSeconds % cycleDurationSeconds) / cycleDurationSeconds : 0;
  const scrollProgress = cyclePosition <= 0.5 ? cyclePosition * 2 : (1 - cyclePosition) * 2;
  const progress = scrollProgress * scrollProgress * (3 - 2 * scrollProgress);
  return [
    startCenter[0] + (endCenter[0] - startCenter[0]) * progress,
    startCenter[1] + (endCenter[1] - startCenter[1]) * progress
  ];
}

function makeArrowPolygonLayer(
  dataSourceUpdate: ArrowPolygonDataSourceUpdate,
  dataSource: ArrowPolygonDataSource
): ArrowPolygonLayer {
  return new ArrowPolygonLayer({
    id: 'arrow-polygons',
    pickable: true,
    model: dataSourceUpdate.model ?? 'attribute',
    data: dataSourceUpdate.data,
    polygons: 'polygons',
    color:
      dataSourceUpdate.colors === null
        ? [0, 96, 255, 255]
        : {source: 'colors', nullValue: [0, 96, 255, 255]},
    tessellated: dataSourceUpdate.tessellated,
    center: dataSourceUpdate.center,
    scale: dataSourceUpdate.scale,
    onHover: (info: ArrowLayerPickingInfo) => {
      dataSource.setPickedRow(info.arrow?.batchIndex ?? null, info.index ?? null);
    },
    ...dataSourceUpdate.layerProps
  });
}
