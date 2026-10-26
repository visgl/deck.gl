// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {OrthographicView, type ViewStateChangeParameters} from '@deck.gl/core';
import {buildSdfFontAtlas} from '@luma.gl/text';
import {ArrowDeck} from '../arrow-deck';
import {getDeckExampleProps, type DeckExampleDeviceOptions} from '../deck-example-device';
import {GPUCulledArrowTextLayer} from './gpu-culled-arrow-text-layer';
import {GPUCulledTraceLayer} from './gpu-culled-trace-layer';
import {GPUTraceCullingEffect, type GPUTraceCullingStats} from './gpu-trace-culling-effect';
import {GPUCulledTraceUserInterface} from './app-ui';
import {makeDeckTraceData} from './trace-data';

const TRACE_ROW_COUNT = 25_000;
const TRACE_LANE_WINDOW = 72;
let fontAtlas: ReturnType<typeof buildSdfFontAtlas> | undefined;

type TraceViewState = {
  target: [number, number, number];
  zoom: number;
};

/** Creates the WebGPU-only deck.gl trace viewer. */
export function createGPUCulledTraceDeck(
  parent?: HTMLDivElement,
  options: DeckExampleDeviceOptions = {}
) {
  const traceData = makeDeckTraceData(TRACE_ROW_COUNT);
  let cullingEffect: GPUTraceCullingEffect | null = null;
  let animationFrame = 0;
  let lastAnimationTime = 0;
  let autoScroll = true;
  let viewState: TraceViewState = {target: [150, TRACE_LANE_WINDOW / 2, 0], zoom: 0};
  let cullingStats: GPUTraceCullingStats = {
    totalBlocks: traceData.count,
    visibleBlocks: 0,
    outsideBlocks: 0,
    smallBlocks: 0,
    totalGlyphs: 0,
    visibleGlyphs: 0,
    encodeTimeMilliseconds: 0,
    graphNodeCount: 0,
    logicalTransientBytes: 0,
    physicalTransientBytes: 0,
    transientReusePercentage: 0,
    labelStatus: 'Waiting for label layer'
  };
  const userInterface = new GPUCulledTraceUserInterface(traceData, cullingStats);
  userInterface.mount();

  let deck: ArrowDeck<OrthographicView>;
  deck = new ArrowDeck({
    parent,
    ...getDeckExampleProps({...options, deviceType: 'webgpu'}),
    views: new OrthographicView({id: 'main'}),
    viewState,
    controller: {
      dragPan: true,
      scrollZoom: {smooth: true, speed: 0.02},
      doubleClickZoom: true,
      touchZoom: true
    },
    layers: [],
    effects: [],
    getTooltip: info => userInterface.getTooltip(info),
    onViewStateChange: ({viewState: nextViewState}: ViewStateChangeParameters) => {
      viewState = nextViewState as TraceViewState;
      autoScroll = false;
      deck.setProps({viewState});
    },
    onLoad: ({deck: loadedDeck, device}) => {
      if (device.type !== 'webgpu') throw new Error('GPU-culled deck trace requires WebGPU');
      cullingEffect = new GPUTraceCullingEffect(device, traceData, {
        onStats: stats => {
          cullingStats = stats;
          userInterface.updateCullingStats(stats);
        }
      });
      const resources = cullingEffect.resources;
      const textLayer = new GPUCulledArrowTextLayer({
        id: 'gpu-culled-trace-labels',
        data: traceData.textTable,
        pickable: true,
        fontAtlas: getFontAtlas(),
        model: 'storage-row-indexed',
        positions: 'positions',
        texts: 'texts',
        clipRects: 'clipRects',
        angles: null,
        sizes: null,
        pixelOffsets: null,
        textAnchors: null,
        alignmentBaselines: null,
        color: [245, 248, 255, 255],
        size: 24,
        pixelOffset: [2, 0],
        textAnchor: 'start',
        alignmentBaseline: 'center',
        contentAlignHorizontal: 'start',
        contentAlignVertical: 'none',
        contentCutoffPixels: [0, 0],
        onDataError: error => cullingEffect?.setLabelError(error)
      });
      cullingEffect.setTextLayer(textLayer);
      loadedDeck.setProps({
        effects: [cullingEffect],
        layers: [
          new GPUCulledTraceLayer({
            id: 'gpu-culled-trace-blocks',
            data: [],
            pickable: true,
            spans: resources.spans,
            visibleIds: resources.visibleIds,
            viewUniforms: resources.viewUniforms,
            drawCommands: resources.blockDrawCommands
          }),
          textLayer
        ]
      });
    },
    onFinalize: () => {
      cancelAnimationFrame(animationFrame);
      userInterface.finalize();
    }
  });

  const animate = (time: number): void => {
    const labelsArePreparing = cullingEffect && cullingStats.totalGlyphs === 0;
    if (
      cullingEffect &&
      (autoScroll || labelsArePreparing) &&
      time - lastAnimationTime >= 1000 / 30
    ) {
      lastAnimationTime = time;
      if (autoScroll) {
        viewState = {
          ...viewState,
          target: [150 + ((time * 0.025) % 1000), viewState.target[1], 0]
        };
        deck.setProps({viewState});
      }
      deck.redraw('trace animation');
    }
    animationFrame = requestAnimationFrame(animate);
  };
  animationFrame = requestAnimationFrame(animate);
  return deck;
}

function getFontAtlas(): ReturnType<typeof buildSdfFontAtlas> {
  fontAtlas ??= buildSdfFontAtlas({
    characterSet: ' abcdefghijklmnopqrstuvwxyz0123456789-μé',
    fontFamily: 'Monaco, Menlo, monospace',
    fontWeight: '600',
    fontSize: 48,
    buffer: 5,
    radius: 10
  });
  return fontAtlas;
}
