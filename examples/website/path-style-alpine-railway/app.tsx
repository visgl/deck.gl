// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {TerrainLayer} from '@deck.gl/geo-layers';
import {PathLayer, ScatterplotLayer} from '@deck.gl/layers';
import {DeckGL, PopupWidget} from '@deck.gl/react';
import {PathStyleExtension} from '@deck.gl/extensions';
import {TerrainLoader} from '@loaders.gl/terrain';
import '@deck.gl/widgets/stylesheet.css';

import type {PickingInfo} from '@deck.gl/core';
import type {PathStyleExtensionProps} from '@deck.gl/extensions';
import type {Device} from '@luma.gl/core';

import {
  ELEVATION_DECODER,
  HIDDEN_PATTERN_PIXELS,
  RAIL_STROKE_WIDTH_METERS,
  SCENES,
  SLEEPER_LENGTH_METERS,
  SLEEPER_PATTERN_METERS,
  STRUCTURE_PATTERN_PIXELS,
  TERRAIN_ASSETS,
  TRACK_BED_WIDTH_METERS,
  TRACK_COLORS,
  TRACK_ELEVATION_OFFSET_METERS,
  getGaugeMeters
} from './constants';
import {AnatomyKey, createTrackPopupHtml} from './overlays';
import type {
  Position3D,
  RailCopy,
  RailwayScene,
  RailwayTrack,
  RenderedRailwayTrack,
  SceneId,
  SourceVertex,
  ViewMode
} from './types';

const SLEEPER_EXTENSION = new PathStyleExtension({dashMode: 'path'});
const RAIL_EXTENSION = new PathStyleExtension({offset: true});
const HIDDEN_EXTENSION = new PathStyleExtension({dashMode: 'path'});
const STRUCTURE_EXTENSION = new PathStyleExtension({dashMode: 'path'});

type SelectedTrack = {track: RailwayTrack; position: Position3D};

function getRailOffset(track: RailCopy): number {
  return (track.side * (getGaugeMeters(track) / 2)) / RAIL_STROKE_WIDTH_METERS;
}

function getTrackMidpoint(track: RailwayTrack): Position3D {
  const position = track.path[Math.floor(track.path.length / 2)];
  return [position[0], position[1], position[2] + TRACK_ELEVATION_OFFSET_METERS];
}

function getInitialViewState(scene: RailwayScene) {
  const isPortrait =
    typeof window !== 'undefined' &&
    window.innerWidth < 600 &&
    window.innerHeight > window.innerWidth;
  return isPortrait
    ? {
        ...scene.initialViewState,
        zoom: scene.initialViewState.zoom - 1,
        pitch: Math.min(scene.initialViewState.pitch || 0, 30),
        bearing: (scene.initialViewState.bearing || 0) + 25
      }
    : scene.initialViewState;
}

export default function App({
  device,
  sceneId = 'albula-landwasser',
  viewMode = 'finished'
}: {
  device?: Device;
  sceneId?: SceneId;
  viewMode?: ViewMode;
}) {
  const scene = SCENES[sceneId];
  const terrainAssets = TERRAIN_ASSETS[sceneId];
  const [selectedTrack, setSelectedTrack] = useState<SelectedTrack | null>(null);

  useEffect(() => setSelectedTrack(null), [sceneId]);

  const {exposedTracks, hiddenTracks, bridgeTracks, railCopies, sourceVertices} = useMemo(() => {
    const renderedTracks: RenderedRailwayTrack[] = scene.tracks.map(track => ({
      ...track,
      renderedPath: track.path.map(
        position =>
          [position[0], position[1], position[2] + TRACK_ELEVATION_OFFSET_METERS] as Position3D
      )
    }));
    const exposed = renderedTracks.filter(
      track => track.structure !== 'tunnel' && track.structure !== 'covered'
    );
    return {
      exposedTracks: exposed,
      hiddenTracks: renderedTracks.filter(
        track => track.structure === 'tunnel' || track.structure === 'covered'
      ),
      bridgeTracks: renderedTracks.filter(track => track.structure === 'bridge'),
      railCopies: exposed.flatMap(track => [
        {...track, side: -1 as const},
        {...track, side: 1 as const}
      ]),
      sourceVertices: scene.tracks.flatMap(track =>
        track.path.map((position, vertexIndex) => ({position, trackId: track.id, vertexIndex}))
      )
    };
  }, [scene]);

  const layers = [
    new TerrainLayer({
      id: `terrain-${sceneId}`,
      elevationData: terrainAssets.elevation,
      texture: terrainAssets.texture,
      bounds: scene.terrain.bounds,
      elevationDecoder: ELEVATION_DECODER,
      meshMaxError: 1,
      color: terrainAssets.color,
      loaders: [TerrainLoader],
      loadOptions: {core: {worker: false}},
      material: false,
      wireframe: false
    }),
    new PathLayer<RenderedRailwayTrack>({
      id: `track-bed-${sceneId}`,
      data: exposedTracks,
      getPath: track => track.renderedPath,
      widthUnits: 'meters',
      getWidth: TRACK_BED_WIDTH_METERS,
      getColor: TRACK_COLORS.ballast,
      capRounded: false,
      jointRounded: true
    }),
    new PathLayer<RenderedRailwayTrack, PathStyleExtensionProps<RenderedRailwayTrack>>({
      id: `sleepers-${sceneId}`,
      data: exposedTracks,
      getPath: track => track.renderedPath,
      widthUnits: 'meters',
      getWidth: SLEEPER_LENGTH_METERS,
      getColor: TRACK_COLORS.sleeper,
      getDashArray: SLEEPER_PATTERN_METERS,
      dashUnits: 'meters',
      dashGapPickable: true,
      capRounded: false,
      jointRounded: false,
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 211, 118, 150],
      extensions: [SLEEPER_EXTENSION]
    }),
    new PathLayer<RailCopy, PathStyleExtensionProps<RailCopy>>({
      id: `rails-${sceneId}`,
      data: railCopies,
      getPath: track => track.renderedPath,
      widthUnits: 'meters',
      getWidth: RAIL_STROKE_WIDTH_METERS,
      getOffset: getRailOffset,
      getColor: TRACK_COLORS.rail,
      capRounded: true,
      jointRounded: true,
      extensions: [RAIL_EXTENSION]
    }),
    new PathLayer<RenderedRailwayTrack, PathStyleExtensionProps<RenderedRailwayTrack>>({
      id: `hidden-alignment-${sceneId}`,
      data: hiddenTracks,
      getPath: track => track.renderedPath,
      billboard: true,
      widthUnits: 'pixels',
      getWidth: 3.5,
      getColor: TRACK_COLORS.hidden,
      getDashArray: HIDDEN_PATTERN_PIXELS,
      dashUnits: 'pixels',
      dashGapPickable: true,
      capRounded: true,
      jointRounded: true,
      pickable: true,
      parameters: {depthCompare: 'always'},
      extensions: [HIDDEN_EXTENSION]
    }),
    viewMode === 'anatomy' &&
      new PathLayer<RenderedRailwayTrack, PathStyleExtensionProps<RenderedRailwayTrack>>({
        id: `bridge-inspection-${sceneId}`,
        data: bridgeTracks,
        getPath: track => track.renderedPath,
        billboard: true,
        widthUnits: 'pixels',
        getWidth: 7,
        getColor: TRACK_COLORS.structureOverlay,
        getDashArray: STRUCTURE_PATTERN_PIXELS,
        dashUnits: 'pixels',
        dashJustified: true,
        dashGapPickable: true,
        pickable: true,
        parameters: {depthCompare: 'always'},
        extensions: [STRUCTURE_EXTENSION]
      }),
    viewMode === 'anatomy' &&
      new PathLayer<RailwayTrack>({
        id: `source-centerline-${sceneId}`,
        data: scene.tracks,
        getPath: track => track.path,
        widthUnits: 'pixels',
        getWidth: 2,
        getColor: TRACK_COLORS.centerline,
        parameters: {depthCompare: 'always'}
      }),
    viewMode === 'anatomy' &&
      new ScatterplotLayer<SourceVertex>({
        id: `source-vertices-${sceneId}`,
        data: sourceVertices,
        getPosition: vertex => vertex.position,
        radiusUnits: 'pixels',
        getRadius: 2.5,
        getFillColor: TRACK_COLORS.sourceVertex,
        stroked: false,
        parameters: {depthCompare: 'always'}
      })
  ];

  return (
    <div
      role="region"
      tabIndex={0}
      aria-label={
        `Interactive ${scene.label} railway. ${scene.description} ${viewMode} view. ` +
        'Use the arrow keys to move the camera and Enter to inspect successive track segments.'
      }
      onKeyDown={event => {
        if (event.key === 'Enter') {
          event.preventDefault();
          const selectedIndex = selectedTrack
            ? scene.tracks.findIndex(track => track.id === selectedTrack.track.id)
            : -1;
          const track = scene.tracks[(selectedIndex + 1) % scene.tracks.length];
          setSelectedTrack({track, position: getTrackMidpoint(track)});
        }
      }}
      style={{position: 'absolute', inset: 0}}
    >
      <DeckGL
        key={sceneId}
        device={device}
        layers={layers}
        initialViewState={getInitialViewState(scene)}
        controller={true}
        pickingRadius={5}
        style={{background: 'radial-gradient(circle at 55% 35%, #27312f 0%, #101619 72%)'}}
        onClick={(info: PickingInfo<RailwayTrack>) => {
          if (!info.object) {
            setSelectedTrack(null);
            return;
          }
          const coordinate =
            info.coordinate || info.object.path[Math.floor(info.object.path.length / 2)];
          setSelectedTrack({
            track: info.object,
            position: [coordinate[0], coordinate[1], coordinate[2] ?? 0]
          });
        }}
      >
        {selectedTrack && (
          <PopupWidget
            id="railway-track-details"
            position={selectedTrack.position}
            content={{html: createTrackPopupHtml(selectedTrack.track, scene)}}
            placement="top"
            offset={14}
            closeButton
            onOpenChange={isOpen => !isOpen && setSelectedTrack(null)}
            style={{pointerEvents: 'auto', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.4)'}}
          />
        )}
        {viewMode === 'anatomy' && <AnatomyKey />}
      </DeckGL>
    </div>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  const searchParams = new URLSearchParams(window.location.search);
  const requestedScene = searchParams.get('scene') as SceneId | null;
  const sceneId = requestedScene && SCENES[requestedScene] ? requestedScene : 'albula-landwasser';
  const viewMode = searchParams.get('view') === 'anatomy' ? 'anatomy' : 'finished';
  createRoot(container).render(<App sceneId={sceneId} viewMode={viewMode} />);
}
