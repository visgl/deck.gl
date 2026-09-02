// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';

import {
  DEFAULT_GAUGE_METERS,
  HIDDEN_PATTERN_PIXELS,
  SLEEPER_PATTERN_METERS,
  STRUCTURE_PATTERN_PIXELS,
  SWISSTOPO_ATTRIBUTION,
  SWISSTOPO_RAILWAY_URL,
  TRACK_COLORS,
  TRACK_ELEVATION_OFFSET_METERS,
  getGaugeMeters
} from './constants';
import type {RailwayScene, RailwayTrack} from './types';

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function createTrackPopupHtml(track: RailwayTrack, scene: RailwayScene): string {
  const sourceIds = track.sourceObjectIds.map(escapeHtml).join('<br>');
  const sourcedGauge = track.gaugeMeters !== null;
  const pathStyle =
    track.structure === 'tunnel' || track.structure === 'covered'
      ? `${HIDDEN_PATTERN_PIXELS[0]} px dash · ${HIDDEN_PATTERN_PIXELS[1]} px gap · billboarded`
      : `${SLEEPER_PATTERN_METERS[0]} m sleeper · ${SLEEPER_PATTERN_METERS[1]} m gap · ` +
        `rails offset ±${(getGaugeMeters(track) / 2).toFixed(2)} m`;

  return (
    '<div style="min-width:230px;max-width:310px;font:13px/1.45 system-ui,sans-serif;color:#172126">' +
    `<div style="color:#63757d">${escapeHtml(scene.label)}</div>` +
    `<strong style="display:block;font-size:14px;margin-bottom:5px">${escapeHtml(track.label)}</strong>` +
    `<div><span style="color:#63757d">Structure:</span> ${escapeHtml(track.structure)}</div>` +
    `<div><span style="color:#63757d">Source class:</span> ${escapeHtml(track.sourceClass || 'not supplied')}</div>` +
    `<div><span style="color:#63757d">Source updated:</span> ${escapeHtml(track.sourceUpdatedAt || 'not supplied')}</div>` +
    '<div style="margin-top:8px;color:#63757d">PathStyleExtension</div>' +
    `<div>${escapeHtml(pathStyle)}</div>` +
    `<div>${sourcedGauge ? 'Gauge sourced' : '1.0 m visual gauge derived'} · pattern gaps pickable</div>` +
    `<div>Track display lift ${TRACK_ELEVATION_OFFSET_METERS} m · source Z unchanged</div>` +
    '<div style="margin-top:8px;color:#63757d">Source object ID</div>' +
    `<div style="font:11px/1.35 ui-monospace,monospace;overflow-wrap:anywhere">${sourceIds}</div>` +
    `<div style="margin-top:8px"><a href="${SWISSTOPO_RAILWAY_URL}" target="_blank" ` +
    `rel="noopener noreferrer" style="color:#006dc7;text-decoration:underline">${SWISSTOPO_ATTRIBUTION}</a></div>` +
    '</div>'
  );
}

export function AnatomyKey() {
  return (
    <div
      role="note"
      style={{
        position: 'absolute',
        left: 16,
        bottom: 16,
        padding: '10px 12px',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: 4,
        background: 'rgba(12, 18, 20, 0.82)',
        color: '#eef3f1',
        font: '12px/1.5 system-ui, sans-serif',
        pointerEvents: 'none'
      }}
    >
      <div style={{color: `rgb(${TRACK_COLORS.centerline.slice(0, 3)})`}}>
        Source · XYZ centerline and vertices
      </div>
      <div style={{color: `rgb(${TRACK_COLORS.sleeper.slice(0, 3)})`}}>
        Derived · {SLEEPER_PATTERN_METERS.join(' + ')} m sleepers · rails ±
        {(DEFAULT_GAUGE_METERS / 2).toFixed(2)} m
      </div>
      <div style={{color: `rgb(${TRACK_COLORS.structureOverlay.slice(0, 3)})`}}>
        Diagram · {STRUCTURE_PATTERN_PIXELS.join(' + ')} px justified bridge pattern
      </div>
    </div>
  );
}
