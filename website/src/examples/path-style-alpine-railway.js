// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/path-style-alpine-railway/app';
import {
  SCENE_LABELS,
  SCENE_ORDER,
  SWISSTOPO_RAILWAY_URL,
  SWISSTOPO_TERRAIN_URL,
  TRACK_COLORS
} from 'website-examples/path-style-alpine-railway/constants';

import {makeExample} from '../components';

const SCENE_IDS_BY_LABEL = Object.fromEntries(
  SCENE_ORDER.map(sceneId => [SCENE_LABELS[sceneId], sceneId])
);

function LegendItem({label, color, dashed = false}) {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 10, margin: '7px 0'}}>
      <span
        style={{
          width: 44,
          height: 6,
          flex: '0 0 auto',
          borderRadius: 2,
          background: dashed
            ? `repeating-linear-gradient(90deg, ${color} 0 9px, transparent 9px 15px)`
            : color
        }}
      />
      <span>{label}</span>
    </div>
  );
}

class AlpineRailwayDemo extends Component {
  static title = 'Alpine Railway';

  static code = `${GITHUB_TREE}/examples/website/path-style-alpine-railway`;

  static parameters = {
    scene: {
      displayName: 'Scene',
      type: 'select',
      options: SCENE_ORDER.map(sceneId => SCENE_LABELS[sceneId]),
      value: SCENE_LABELS['albula-landwasser']
    },
    view: {
      displayName: 'View',
      type: 'select',
      options: ['Finished', 'Anatomy'],
      value: 'Finished'
    }
  };

  static renderInfo() {
    return (
      <div>
        <p>
          Sparse official XYZ centerlines become sleepers, paired rails, and screen-stable hidden
          track through PathStyleExtension.
        </p>
        <div style={{margin: '18px 0'}}>
          <LegendItem
            label="Runtime sleepers"
            color={`rgb(${TRACK_COLORS.sleeper.slice(0, 3)})`}
          />
          <LegendItem label="Offset rails" color={`rgb(${TRACK_COLORS.rail.slice(0, 3)})`} />
          <LegendItem
            label="Tunnel / gallery"
            color={`rgb(${TRACK_COLORS.hidden.slice(0, 3)})`}
            dashed
          />
        </div>
        <p>
          Orbit, pitch, zoom, or click any track segment. Anatomy reveals the official centerline,
          source vertices, and a diagrammatic endpoint-fitted bridge pattern.
        </p>
        <p>
          Sleepers are generated at render time from the official 3D railway centerline. Their
          spacing and size are a visual construction, not source-mapped individual objects. Paired
          rails are the same kind of derived visual construction.
        </p>
        <p>Derived from Federal Office of Topography swisstopo data.</p>
        <p>
          Source: Federal Office of Topography swisstopo ·{' '}
          <a href={SWISSTOPO_RAILWAY_URL}>railway</a> ·{' '}
          <a href={SWISSTOPO_TERRAIN_URL}>terrain</a>
        </p>
      </div>
    );
  }

  render() {
    const {params, mapStyle, ...otherProps} = this.props;
    return (
      <App
        {...otherProps}
        sceneId={SCENE_IDS_BY_LABEL[params.scene.value]}
        viewMode={params.view.value === 'Anatomy' ? 'anatomy' : 'finished'}
      />
    );
  }
}

export default makeExample(AlpineRailwayDemo);
