// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {Deck, OrthographicView, type OrthographicViewState} from '@deck.gl/core';
import {ArrowTextLayer} from '@deck.gl-community/arrow-layers';
import {buildSdfFontAtlas, type FontAtlas} from '@luma.gl/text';
import {ArrowDeck} from '../arrow-deck';
import {getDeckExampleProps, type DeckExampleDeviceOptions} from '../deck-example-device';
import {getArrowLayerTooltip} from '../arrow-layer-tooltip';
import {LABEL_FIELD_WIDTH} from '../../arrow/arrow-text-2d/arrow-text-data';
import {ArrowTextDataSource, type ArrowTextDataSourceUpdate} from './arrow-text-data-source';

let fontAtlas: FontAtlas | undefined;

function getFontAtlas(): FontAtlas {
  fontAtlas ??= buildSdfFontAtlas({
    characterSet: ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/-',
    fontFamily: 'Monaco, Menlo, monospace',
    fontWeight: '600',
    fontSize: 64,
    buffer: 6,
    radius: 12
  });
  return fontAtlas;
}
const CAMERA_PAN_SPEED_X = 72;
const CAMERA_PAN_SPEED_Y = 56;

/** Creates the standalone or website-hosted Deck text-layer example. */
export function createArrowTextLayerDeck(
  parent?: HTMLDivElement,
  options: DeckExampleDeviceOptions = {}
) {
  let activeUpdate: ArrowTextDataSourceUpdate | null = null;
  let animationSeconds = 0;
  let camera: OrthographicViewState = {target: [0, 0, 0], zoom: 0};
  let previousTarget: [number, number] = [0, 0];
  let lastAnimationMilliseconds: number | null = null;

  const deck = new ArrowDeck<OrthographicView>({
    parent,
    ...getDeckExampleProps(options),
    views: new OrthographicView({id: 'main'}),
    initialViewState: {target: [0, 0], zoom: 0},
    controller: true,
    onViewStateChange: ({viewState}) => {
      camera = viewState;
      deck.setProps({viewState: camera});
    },
    getTooltip: getArrowLayerTooltip,
    layers: [],
    onLoad: ({device}) => dataSource.initialize(device),
    onBeforeRender: ({deck}) => {
      const timeMilliseconds = performance.now();
      if (lastAnimationMilliseconds !== null && activeUpdate?.animate) {
        animationSeconds += Math.max(timeMilliseconds - lastAnimationMilliseconds, 0) / 1000;
      }
      lastAnimationMilliseconds = timeMilliseconds;
      if (activeUpdate?.animate) {
        const target = getTextCameraTarget(activeUpdate.labelFieldHeight, animationSeconds);
        camera = {
          ...camera,
          target: [
            camera.target![0] + target[0] - previousTarget[0],
            camera.target![1] + target[1] - previousTarget[1],
            camera.target![2] ?? 0
          ]
        };
        previousTarget = target;
        deck.setProps({viewState: camera});
      }
    },
    onFinalize: () => dataSource.finalize()
  });

  const dataSource = new ArrowTextDataSource({
    onDataUpdated: (update: ArrowTextDataSourceUpdate) => {
      activeUpdate = update;
      animationSeconds = 0;
      lastAnimationMilliseconds = null;
      setTextLayer(deck, update);
    }
  });

  return deck;
}

function setTextLayer(deck: Deck<OrthographicView>, dataSource: ArrowTextDataSourceUpdate): void {
  deck.setProps({
    layers: [
      new ArrowTextLayer({
        id: 'arrow-text',
        pickable: true,
        fontAtlas: getFontAtlas(),
        model: dataSource.model ?? 'auto',
        data: dataSource.asyncIterator,
        positions: 'positions',
        texts: 'texts',
        clipRects: dataSource.clipRects === null ? null : 'clipRects',
        color: dataSource.colorColumn
          ? {source: 'colors', nullValue: [199, 219, 245, 255]}
          : [199, 219, 245, 255],
        angles: dataSource.angles === null ? null : 'angles',
        sizes: dataSource.sizes === null ? null : 'sizes',
        pixelOffsets: null,
        angle: 0,
        size: 32,
        ...dataSource.layerProps
      })
    ]
  });
}

function getTextCameraTarget(labelFieldHeight: number, animationSeconds: number): [number, number] {
  const cameraOffsetAmplitudeX = LABEL_FIELD_WIDTH * 0.43;
  const cameraOffsetAmplitudeY = labelFieldHeight * 0.38;
  return [
    Math.sin(animationSeconds * (CAMERA_PAN_SPEED_X / cameraOffsetAmplitudeX)) *
      cameraOffsetAmplitudeX,
    Math.cos(animationSeconds * (CAMERA_PAN_SPEED_Y / cameraOffsetAmplitudeY)) *
      cameraOffsetAmplitudeY
  ];
}
