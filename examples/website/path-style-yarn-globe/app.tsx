// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {useEffect, useMemo, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {DeckGL} from '@deck.gl/react';
import {
  COORDINATE_SYSTEM,
  _GlobeView as GlobeView,
  type GlobeViewState,
  type PickingInfo
} from '@deck.gl/core';
import {PathLayer} from '@deck.gl/layers';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {PathStyleExtension} from '@deck.gl/extensions';
import {SphereGeometry} from '@luma.gl/engine';

import type {DashMode, DashUnits, PathStyleExtensionProps} from '@deck.gl/extensions';
import type {Device} from '@luma.gl/core';

import {
  YARN_STYLES,
  createFibonacciYarnStrand,
  createFoundationStrands,
  createYarnStrands
} from './yarn-paths';
import type {
  FoundationStrand,
  YarnDashMotifName,
  YarnLayoutMode,
  YarnPaletteName,
  YarnStrand,
  YarnStyle
} from './yarn-paths';

export {YARN_DASH_MOTIF_NAMES, YARN_PALETTE_NAMES, YARN_UNIT_LEGEND} from './yarn-paths';

const GLOBE_RADIUS_METERS = 6.3e6;
const CORE_MESH = new SphereGeometry({radius: GLOBE_RADIUS_METERS, nlat: 48, nlong: 96});
const NESTED_STYLE_EXTENSIONS: Record<DashMode, PathStyleExtension> = {
  path: new PathStyleExtension({dashMode: 'path', offset: true}),
  segment: new PathStyleExtension({dashMode: 'segment', offset: true})
};
const FIBONACCI_EXTENSIONS: Record<DashMode, PathStyleExtension> = {
  path: new PathStyleExtension({dashMode: 'path', offset: true}),
  segment: new PathStyleExtension({dashMode: 'segment', offset: true})
};
const STARFIELD_BACKGROUND = [
  'radial-gradient(circle at 7% 18%, rgba(255,255,255,.9) 0 1px, transparent 1.8px)',
  'radial-gradient(circle at 13% 72%, rgba(158,211,255,.75) 0 1px, transparent 1.7px)',
  'radial-gradient(circle at 21% 39%, rgba(255,255,255,.68) 0 1px, transparent 1.8px)',
  'radial-gradient(circle at 29% 88%, rgba(255,216,173,.8) 0 1px, transparent 1.8px)',
  'radial-gradient(circle at 39% 11%, rgba(255,255,255,.8) 0 1px, transparent 2px)',
  'radial-gradient(circle at 47% 68%, rgba(164,218,255,.68) 0 1px, transparent 1.8px)',
  'radial-gradient(circle at 58% 7%, rgba(255,255,255,.72) 0 1px, transparent 1.7px)',
  'radial-gradient(circle at 65% 84%, rgba(255,231,201,.8) 0 1px, transparent 1.8px)',
  'radial-gradient(circle at 73% 23%, rgba(184,222,255,.78) 0 1px, transparent 2px)',
  'radial-gradient(circle at 82% 59%, rgba(255,255,255,.72) 0 1px, transparent 1.7px)',
  'radial-gradient(circle at 91% 14%, rgba(255,218,179,.86) 0 1px, transparent 2px)',
  'radial-gradient(circle at 95% 81%, rgba(255,255,255,.76) 0 1px, transparent 1.8px)',
  'radial-gradient(circle at 20% 13%, rgba(255,174,99,.19), transparent 29%)',
  'radial-gradient(circle at 52% 44%, #172641 0%, #080f20 43%, #02040c 76%, #010208 100%)'
].join(',');

export type YarnGlobeProps = {
  device?: Device;
  layoutMode?: YarnLayoutMode;
  paletteName?: YarnPaletteName;
  colorCycles?: number;
  colorPhase?: number;
  dashMotif?: YarnDashMotifName;
  dashMode?: DashMode;
  dashUnits?: DashUnits;
  dashJustified?: boolean;
  dashScale?: number;
  gapScale?: number;
  strandCount?: number;
  depthScale?: number;
  offsetScale?: number;
  thicknessScale?: number;
  capRounded?: boolean;
  spin?: boolean;
  spinSpeed?: number;
  panelOffset?: boolean;
};

type NestedScene = {
  layout: 'nested';
  strands: YarnStrand[];
  foundationStrands: FoundationStrand[];
  strandGroups: Map<string, YarnStrand[]>;
};

type FibonacciScene = {
  layout: 'fibonacci';
  strand: YarnStrand;
};

type YarnScene = NestedScene | FibonacciScene;

export default function App({
  device,
  layoutMode = 'fibonacci',
  paletteName = 'Vivid rainbow',
  colorCycles = 8,
  colorPhase = 0,
  dashMotif = 'Even checks',
  dashMode = 'path',
  dashUnits = 'pixels',
  dashJustified = false,
  dashScale = 1,
  gapScale = 1,
  strandCount = 377,
  depthScale = 1,
  offsetScale = 0,
  thicknessScale = 1,
  capRounded = true,
  spin = true,
  spinSpeed = 1,
  panelOffset = false
}: YarnGlobeProps) {
  const [viewState, setViewState] = useState<GlobeViewState>(getInitialViewState);
  const isInteracting = useRef(false);
  const resumeSpinAt = useRef(0);
  const webglDevice = device?.type === 'webgl' ? device : undefined;
  const globeView = useMemo(
    () =>
      new GlobeView({
        resolution: 4,
        padding:
          panelOffset && (typeof window === 'undefined' || window.innerWidth > 768)
            ? {right: '28%'}
            : null
      }),
    [panelOffset]
  );

  const scene = useMemo<YarnScene>(() => {
    if (layoutMode === 'fibonacci') {
      return {
        layout: 'fibonacci',
        strand: createFibonacciYarnStrand({
          anchorCount: strandCount,
          depthScale,
          paletteName,
          colorCycles,
          colorPhase,
          dashMode,
          dashUnits,
          dashJustified,
          dashMotif,
          dashScale,
          gapScale,
          offset: offsetScale,
          capRounded,
          jointRounded: true,
          billboard: true
        })
      };
    }

    // The Fibonacci layout needs many more anchors than the layered layout needs courses.
    const nestedStrandCount = getNestedStrandCount(strandCount);
    const strands = createYarnStrands(nestedStrandCount);
    const strandGroups = new Map<string, YarnStrand[]>();
    for (const style of YARN_STYLES) {
      strandGroups.set(style.styleId, []);
    }
    for (const strand of strands) {
      strandGroups.get(strand.style.styleId)?.push(strand);
    }
    return {
      layout: 'nested',
      strands,
      foundationStrands: createFoundationStrands(Math.round(nestedStrandCount * 0.65)),
      strandGroups
    };
  }, [
    capRounded,
    colorCycles,
    colorPhase,
    dashJustified,
    dashMode,
    dashMotif,
    dashScale,
    dashUnits,
    depthScale,
    gapScale,
    layoutMode,
    offsetScale,
    paletteName,
    strandCount
  ]);

  const layers = useMemo(() => {
    const coreLayer = new SimpleMeshLayer<number>({
      id: 'yarn-dark-core',
      data: [0],
      mesh: CORE_MESH,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      getPosition: [0, 0, 0],
      getColor: [15, 13, 27, 255],
      material: false,
      parameters: {cullMode: 'back'}
    });

    if (scene.layout === 'fibonacci') {
      const {strand} = scene;
      const style = strand.style;
      const extension = FIBONACCI_EXTENSIONS[style.dashMode];
      const sharedProps = {
        data: [strand],
        _pathType: 'open' as const,
        getPath: (item: YarnStrand) => item.path,
        getWidth: (item: YarnStrand) => item.width,
        widthUnits: 'pixels' as const,
        widthScale: thicknessScale,
        widthMinPixels: 1,
        getDashArray: (item: YarnStrand) => item.dashArray,
        dashUnits: style.units,
        dashJustified: style.dashJustified,
        getOffset: (item: YarnStrand) => item.offset,
        billboard: style.billboard,
        capRounded: style.capRounded,
        jointRounded: style.jointRounded,
        antialiasing: true,
        parameters: {cullMode: 'none' as const},
        extensions: [extension]
      };

      return [
        coreLayer,
        new PathLayer<YarnStrand, PathStyleExtensionProps<YarnStrand>>({
          ...sharedProps,
          id: 'fibonacci-yarn-casing',
          getColor: [7, 6, 17, 245],
          getWidth: item => item.width + 1.6
        }),
        new PathLayer<YarnStrand, PathStyleExtensionProps<YarnStrand>>({
          ...sharedProps,
          id: 'fibonacci-yarn-color',
          getColor: item => item.color,
          dashGapPickable: true,
          pickable: true
        })
      ];
    }

    const styleLayers = YARN_STYLES.map(style => {
      const extension = NESTED_STYLE_EXTENSIONS[style.dashMode];
      const data = scene.strandGroups.get(style.styleId);
      const getScaledDashArray = (strand: YarnStrand) =>
        [strand.dashArray[0] * dashScale, strand.dashArray[1] * gapScale] as [number, number];
      return new PathLayer<YarnStrand, PathStyleExtensionProps<YarnStrand>>({
        id: `yarn-${style.styleId}`,
        data,
        _pathType: 'open',
        getPath: strand => strand.path,
        getColor: strand => strand.color,
        getWidth: strand => strand.width,
        widthUnits: 'pixels',
        widthScale: thicknessScale,
        widthMinPixels: 1,
        getDashArray: getScaledDashArray,
        dashUnits: style.units,
        dashJustified: style.dashJustified,
        dashGapPickable: true,
        getOffset: strand => strand.offset,
        billboard: style.billboard,
        capRounded: style.capRounded,
        jointRounded: style.jointRounded,
        antialiasing: true,
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 120],
        parameters: {cullMode: 'none'},
        extensions: [extension]
      });
    });

    return [
      coreLayer,
      new PathLayer<FoundationStrand>({
        id: 'yarn-foundation',
        data: scene.foundationStrands,
        _pathType: 'open',
        getPath: strand => strand.path,
        getColor: strand => strand.color,
        getWidth: strand => strand.width,
        widthUnits: 'pixels',
        widthScale: thicknessScale,
        capRounded: true,
        jointRounded: true,
        antialiasing: true,
        parameters: {cullMode: 'none'}
      }),
      new PathLayer<YarnStrand>({
        id: 'yarn-nested-casing',
        data: scene.strands,
        _pathType: 'open',
        getPath: strand => strand.path,
        getColor: [8, 7, 17, 190],
        getWidth: strand => strand.width + 1.1,
        widthUnits: 'pixels',
        widthScale: thicknessScale,
        widthMinPixels: 1,
        billboard: true,
        capRounded: true,
        jointRounded: true,
        antialiasing: true,
        parameters: {cullMode: 'none'}
      }),
      styleLayers
    ];
  }, [dashScale, gapScale, scene, thicknessScale]);

  useEffect(() => {
    if (!spin) {
      return undefined;
    }

    let animationFrame = 0;
    let previousTime = performance.now();
    const animate = (time: number) => {
      const elapsed = Math.min(50, time - previousTime);
      previousTime = time;
      if (!isInteracting.current && time >= resumeSpinAt.current) {
        setViewState(current => ({
          ...current,
          longitude: current.longitude + elapsed * 0.0014 * spinSpeed
        }));
      }
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [spin, spinSpeed]);

  const badges =
    scene.layout === 'fibonacci'
      ? [
          '1 continuous yarn',
          `${scene.strand.anchorCount} Fibonacci nodes`,
          `${colorCycles} color repeats`
        ]
      : ['16 dash families', '6 spiral depths', '4 unit systems'];

  return (
    <div
      role="region"
      tabIndex={0}
      aria-label="Interactive globe made from dashed yarn paths. Drag to rotate, scroll to zoom, and hover a strand to inspect its dash style."
      style={{position: 'absolute', inset: 0, overflow: 'hidden', background: STARFIELD_BACKGROUND}}
    >
      <DeckGL
        device={webglDevice}
        deviceProps={webglDevice ? undefined : {type: 'webgl'}}
        views={globeView}
        viewState={viewState}
        controller={{inertia: 700}}
        layers={layers}
        getTooltip={getYarnTooltip}
        onViewStateChange={({viewState: nextViewState}) => {
          setViewState(nextViewState as GlobeViewState);
        }}
        onInteractionStateChange={interactionState => {
          const active = Boolean(
            interactionState.isDragging ||
              interactionState.isPanning ||
              interactionState.isRotating ||
              interactionState.isZooming
          );
          isInteracting.current = active;
          if (!active) {
            resumeSpinAt.current = performance.now() + 1800;
          }
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 18,
          bottom: 16,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 7,
          maxWidth: 430,
          pointerEvents: 'none',
          color: '#dcecff',
          font: '600 10px/1 system-ui, sans-serif',
          letterSpacing: '0.08em',
          textTransform: 'uppercase'
        }}
      >
        {badges.map(label => (
          <span
            key={label}
            style={{
              padding: '7px 9px',
              border: '1px solid rgba(174, 215, 255, 0.2)',
              borderRadius: 20,
              background: 'rgba(3, 10, 24, 0.66)',
              boxShadow: '0 5px 18px rgba(0, 0, 0, 0.24)',
              backdropFilter: 'blur(8px)'
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function getInitialViewState(): GlobeViewState {
  const shortestViewportSide =
    typeof window === 'undefined' ? 480 : Math.min(window.innerWidth, window.innerHeight);
  const targetRadius = shortestViewportSide * 0.52;
  const zoom = Math.max(0.9, Math.min(2.45, Math.log2(targetRadius / 81.5)));
  return {
    longitude: -18,
    latitude: 11,
    zoom,
    minZoom: 0.6,
    maxZoom: 5
  };
}

function getNestedStrandCount(fibonacciAnchorCount: number): number {
  const anchorCount = Math.max(65, Math.min(985, fibonacciAnchorCount));
  if (anchorCount <= 377) {
    return Math.round(64 + ((anchorCount - 65) / (377 - 65)) * (144 - 64));
  }
  return Math.round(144 + ((anchorCount - 377) / (985 - 377)) * (256 - 144));
}

function getYarnTooltip({object}: PickingInfo<YarnStrand>) {
  if (!object) {
    return null;
  }

  const style = object.style;
  const [dash, gap] = object.dashArray.map(value => formatDashValue(value, style));
  const geometry = [
    style.billboard ? 'billboard' : 'surface',
    style.capRounded ? 'round caps' : 'square caps',
    style.offsetEnabled ? `${formatNumber(object.offset)}× lateral offset` : null
  ]
    .filter(Boolean)
    .join(' · ');
  const depth =
    object.layout === 'fibonacci'
      ? `${object.anchorCount} Fibonacci nodes · ${formatNumber(object.altitude / 1000)} km mean altitude`
      : `shell ${object.shellIndex + 1} · ${formatNumber(object.altitude / 1000)} km`;

  return {
    html:
      `<div style="font-weight:750;font-size:13px;margin-bottom:5px">${object.dashMotif}</div>` +
      `<div>${style.dashMode} phase · ${style.dashJustified ? 'endpoint fitted' : 'natural spacing'}</div>` +
      `<div>${dash} dash · ${gap} gap</div>` +
      `<div style="opacity:.68;margin-top:4px">${style.units} · ${depth}</div>` +
      `<div style="opacity:.68">${geometry}</div>`,
    style: {
      backgroundColor: 'rgba(3, 10, 24, 0.92)',
      color: '#f3f8ff',
      border: '1px solid rgba(163, 211, 255, 0.28)',
      borderRadius: '9px',
      boxShadow: '0 10px 28px rgba(0, 0, 0, 0.35)',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      lineHeight: '1.45',
      padding: '9px 11px'
    }
  };
}

function formatDashValue(value: number, style: YarnStyle): string {
  switch (style.units) {
    case 'meters':
      return `${formatNumber(value / 1000)} km`;
    case 'pixels':
      return `${formatNumber(value)} px`;
    case 'widths':
      return `${formatNumber(value)} half-widths`;
    default:
      return `${formatNumber(value)} common`;
  }
}

function formatNumber(value: number): string {
  return Number(value.toPrecision(3)).toLocaleString();
}

export function renderToDOM(container: HTMLDivElement) {
  addCanvasInteractionGuards(container);
  const searchParams = new URLSearchParams(window.location.search);
  const requestedStrandCount = Number(searchParams.get('strands'));
  const strandCount =
    Number.isFinite(requestedStrandCount) && requestedStrandCount > 0
      ? Math.max(65, Math.min(985, Math.floor(requestedStrandCount)))
      : 377;
  const layoutMode = searchParams.get('layout') === 'nested' ? 'nested' : 'fibonacci';
  const spin = searchParams.get('spin') !== 'false';
  createRoot(container).render(
    <App layoutMode={layoutMode} strandCount={strandCount} spin={spin} />
  );
}

function addCanvasInteractionGuards(container: HTMLDivElement): void {
  const preventCanvasBrowserUI = (event: Event) => {
    if (event.target instanceof HTMLCanvasElement) {
      event.preventDefault();
    }
  };
  const listenerOptions = {passive: false};

  for (const type of [
    'contextmenu',
    'selectstart',
    'gesturestart',
    'gesturechange',
    'gestureend'
  ]) {
    container.addEventListener(type, preventCanvasBrowserUI, listenerOptions);
  }
}
