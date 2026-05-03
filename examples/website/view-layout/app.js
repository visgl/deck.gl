// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {COORDINATE_SYSTEM, Deck, OrthographicView} from '@deck.gl/core';
import {PathLayer, PolygonLayer, ScatterplotLayer, TextLayer} from '@deck.gl/layers';
import {
  buildViewsFromViewLayout,
  _HeaderWidget as HeaderWidget,
  _LabelWidget as LabelWidget,
  _SplitterWidget as SplitterWidget
} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

const INITIAL_VIEW_STATE = {
  main: {target: [0, 0, 0], zoom: 0, minZoom: -2, maxZoom: 4},
  'selection-overlay': {target: [0, 0, 0], zoom: 0, minZoom: -2, maxZoom: 4},
  minimap: {target: [0, 0, 0], zoom: -2},
  header: {target: [0, 0, 0], zoom: 0},
  sidebar: {target: [0, 0, 0], zoom: 0}
};

const PANEL_COLOR = [24, 35, 58, 245];
const SIDEBAR_COLOR = [31, 41, 55, 245];
const MAIN_BACKGROUND_COLOR = [248, 250, 252, 255];
const MINIMAP_BACKGROUND_COLOR = [255, 255, 255, 240];
const SIDEBAR_MAIN_SPLIT_ID = 'sidebar-main';
const MINIMAP_VIEW_ID = 'minimap';
const MINIMAP_MARGIN = 16;
const MINIMAP_MIN_WIDTH = 120;
const MINIMAP_MIN_HEIGHT = 80;
const MINIMAP_MAX_WIDTH = 360;
const MINIMAP_MAX_HEIGHT = 260;
const INITIAL_MINIMAP_FRAME = {
  right: MINIMAP_MARGIN,
  bottom: MINIMAP_MARGIN,
  width: 180,
  height: 120
};

const VIEW_LAYOUT = {
  type: 'column',
  children: [
    new OrthographicView({
      id: 'header',
      controller: false,
      height: 64
    }),
    {
      type: 'row',
      splitId: SIDEBAR_MAIN_SPLIT_ID,
      initialSplit: 0.22,
      minSplit: 0.12,
      maxSplit: 0.45,
      children: [
        new OrthographicView({id: 'sidebar', controller: false}),
        {
          type: 'overlay',
          children: [
            new OrthographicView({id: 'main', controller: true}),
            new OrthographicView({id: 'selection-overlay', controller: false}),
            new OrthographicView({
              id: MINIMAP_VIEW_ID,
              x: `calc(100% - ${INITIAL_MINIMAP_FRAME.right + INITIAL_MINIMAP_FRAME.width}px)`,
              y: `calc(100% - ${INITIAL_MINIMAP_FRAME.bottom + INITIAL_MINIMAP_FRAME.height}px)`,
              width: INITIAL_MINIMAP_FRAME.width,
              height: INITIAL_MINIMAP_FRAME.height,
              controller: false,
              clear: true
            })
          ]
        }
      ]
    }
  ]
};

function getPoints() {
  return Array.from({length: 72}, (_, index) => {
    const angle = index * 0.55;
    const radius = 45 + index * 3.2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return {
      position: [x, y],
      radius: 7 + (index % 5),
      color: [40 + (index % 4) * 35, 112 + (index % 6) * 18, 210, 210],
      label: `Node ${index + 1}`
    };
  });
}

function getGridLines() {
  const lines = [];
  for (let i = -300; i <= 300; i += 50) {
    lines.push([
      [-300, i],
      [300, i]
    ]);
    lines.push([
      [i, -300],
      [i, 300]
    ]);
  }
  return lines;
}

const POINTS = getPoints();
const GRID_LINES = getGridLines();
const HEADER_LABELS = [
  {
    text: 'View layout manager',
    position: [-360, -16],
    size: 22,
    color: [255, 255, 255]
  },
  {
    text: 'A declarative row / column / overlay tree compiled into deck.gl views',
    position: [-360, 14],
    size: 13,
    color: [203, 213, 225]
  }
];

const SIDEBAR_LABELS = [
  {text: 'Layout tree', position: [-80, -160], size: 18, color: [255, 255, 255]},
  {text: 'column', position: [-80, -112]},
  {text: 'header: 64px', position: [-64, -78]},
  {text: 'row', position: [-64, -44]},
  {text: 'split id: sidebar-main', position: [-48, -10]},
  {text: 'overlay', position: [-48, 24]},
  {text: 'main + overlay + minimap', position: [-32, 58]}
];

const PASSIVE_LABEL_WIDGETS = [
  new LabelWidget({id: 'header-label', viewId: 'header', label: 'header'}),
  new LabelWidget({id: 'sidebar-label', viewId: 'sidebar', label: 'sidebar'}),
  new LabelWidget({id: 'main-label', viewId: 'main', label: 'main'}),
  new LabelWidget({
    id: 'selection-overlay-label',
    viewId: 'selection-overlay',
    label: 'selection-overlay',
    offset: [54, 0]
  })
];

function getViewportPanel(viewportId, color) {
  return new PolygonLayer({
    id: `${viewportId}-panel`,
    data: [
      {
        polygon: [
          [-1000, -1000],
          [1000, -1000],
          [1000, 1000],
          [-1000, 1000]
        ]
      }
    ],
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    getPolygon: d => d.polygon,
    getFillColor: color,
    parameters: {depthWriteEnabled: false},
    _dataDiff: () => [],
    updateTriggers: {getFillColor: color}
  });
}

function layerFilter({layer, viewport}) {
  return layer.id.startsWith(`${viewport.id}-`);
}

function getMinimapBounds(frame, containerRect) {
  const width = clamp(
    frame.width,
    MINIMAP_MIN_WIDTH,
    Math.max(
      MINIMAP_MIN_WIDTH,
      Math.min(MINIMAP_MAX_WIDTH, containerRect.width - MINIMAP_MARGIN * 2)
    )
  );
  const height = clamp(
    frame.height,
    MINIMAP_MIN_HEIGHT,
    Math.max(
      MINIMAP_MIN_HEIGHT,
      Math.min(MINIMAP_MAX_HEIGHT, containerRect.height - MINIMAP_MARGIN * 2)
    )
  );
  const right = clamp(
    frame.right,
    MINIMAP_MARGIN,
    Math.max(MINIMAP_MARGIN, containerRect.width - width - MINIMAP_MARGIN)
  );
  const bottom = clamp(
    frame.bottom,
    MINIMAP_MARGIN,
    Math.max(MINIMAP_MARGIN, containerRect.height - height - MINIMAP_MARGIN)
  );

  return {
    x: `calc(100% - ${right + width}px)`,
    y: `calc(100% - ${bottom + height}px)`,
    width,
    height
  };
}

function getMinimapFrame(bounds, containerRect) {
  const x = typeof bounds.x === 'number' ? bounds.x : MINIMAP_MARGIN;
  const y = typeof bounds.y === 'number' ? bounds.y : MINIMAP_MARGIN;
  const width = typeof bounds.width === 'number' ? bounds.width : INITIAL_MINIMAP_FRAME.width;
  const height = typeof bounds.height === 'number' ? bounds.height : INITIAL_MINIMAP_FRAME.height;
  return {
    right: Math.max(MINIMAP_MARGIN, containerRect.width - x - width),
    bottom: Math.max(MINIMAP_MARGIN, containerRect.height - y - height),
    width,
    height
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

const LAYERS = [
  getViewportPanel('header', PANEL_COLOR),
  new TextLayer({
    id: 'header-labels',
    data: HEADER_LABELS,
    getPosition: d => d.position,
    getText: d => d.text,
    getSize: d => d.size ?? 14,
    getColor: d => d.color ?? [203, 213, 225],
    getTextAnchor: 'start',
    getAlignmentBaseline: 'center'
  }),

  getViewportPanel('sidebar', SIDEBAR_COLOR),
  new TextLayer({
    id: 'sidebar-labels',
    data: SIDEBAR_LABELS,
    getPosition: d => d.position,
    getText: d => d.text,
    getSize: d => d.size ?? 13,
    getColor: d => d.color ?? [203, 213, 225],
    getTextAnchor: 'start',
    getAlignmentBaseline: 'center'
  }),

  getViewportPanel('main', MAIN_BACKGROUND_COLOR),
  new PathLayer({
    id: 'main-grid',
    data: GRID_LINES,
    getPath: d => d,
    getColor: [203, 213, 225, 130],
    getWidth: 1,
    widthUnits: 'pixels'
  }),
  new ScatterplotLayer({
    id: 'main-points',
    data: POINTS,
    getPosition: d => d.position,
    getRadius: d => d.radius,
    radiusUnits: 'pixels',
    getFillColor: d => d.color,
    pickable: true
  }),

  new PathLayer({
    id: 'selection-overlay-crosshair',
    data: [
      [
        [-18, 0],
        [18, 0]
      ],
      [
        [0, -18],
        [0, 18]
      ]
    ],
    getPath: d => d,
    getColor: [15, 23, 42, 180],
    getWidth: 2,
    widthUnits: 'pixels',
    parameters: {depthWriteEnabled: false}
  }),

  getViewportPanel('minimap', MINIMAP_BACKGROUND_COLOR),
  new ScatterplotLayer({
    id: 'minimap-points',
    data: POINTS,
    getPosition: d => d.position,
    getRadius: 3,
    radiusUnits: 'pixels',
    getFillColor: [37, 99, 235, 180],
    parameters: {depthWriteEnabled: false}
  })
];

export function renderToDOM(container) {
  let deckSize = {
    width: Math.max(1, container.clientWidth),
    height: Math.max(1, container.clientHeight)
  };
  let viewState = {...INITIAL_VIEW_STATE};
  let splitValues = {};
  let minimapFrame = {...INITIAL_MINIMAP_FRAME};
  let deck = null;

  const updateDeck = () => {
    if (!deck) {
      return;
    }

    const baseLayout = buildViewsFromViewLayout({
      layout: VIEW_LAYOUT,
      width: deckSize.width,
      height: deckSize.height,
      splitValues
    });
    const compiled = buildViewsFromViewLayout({
      layout: VIEW_LAYOUT,
      width: deckSize.width,
      height: deckSize.height,
      splitValues,
      viewPropsById: {
        [MINIMAP_VIEW_ID]: getMinimapBounds(minimapFrame, baseLayout.rectsById.main)
      }
    });

    deck.setProps({
      views: compiled.views,
      viewState,
      widgets: [
        new SplitterWidget({
          id: 'sidebar-main-splitter',
          split: compiled.splittersById[SIDEBAR_MAIN_SPLIT_ID],
          onSplitChange: (newSplit, splitId) => {
            splitValues = {...splitValues, [splitId]: newSplit};
            updateDeck();
          }
        }),
        new HeaderWidget({
          id: 'minimap-header',
          viewId: MINIMAP_VIEW_ID,
          label: 'minimap',
          draggable: true,
          resizable: true,
          resizeHandlePosition: 'top-left',
          containerRect: compiled.rectsById.main,
          viewRect: compiled.rectsById[MINIMAP_VIEW_ID],
          onBoundsChange: bounds => {
            minimapFrame = getMinimapFrame(bounds, compiled.rectsById.main);
            updateDeck();
          }
        }),
        ...PASSIVE_LABEL_WIDGETS
      ]
    });
  };

  deck = new Deck({
    parent: container,
    views: [],
    viewState,
    layers: LAYERS,
    layerFilter,
    onResize: ({width, height}) => {
      deckSize = {width, height};
      updateDeck();
    },
    onViewStateChange: ({viewId, viewState: nextViewState}) => {
      if (viewId === 'main') {
        viewState = {
          ...viewState,
          main: nextViewState,
          'selection-overlay': nextViewState
        };
        updateDeck();
      }
    },
    getTooltip: ({object}) => object && 'label' in object && object.label,
    widgets: []
  });

  updateDeck();

  return {
    remove: () => deck.finalize()
  };
}
