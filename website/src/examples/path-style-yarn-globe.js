// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/path-style-yarn-globe/app';
import {
  YARN_DASH_MOTIF_NAMES,
  YARN_PALETTE_NAMES
} from 'website-examples/path-style-yarn-globe/yarn-paths';

import {makeExample} from '../components';

const LAYOUT_BY_LABEL = {
  'Fibonacci strand': 'fibonacci',
  'Layered showcase': 'nested'
};

const DASH_MODE_BY_LABEL = {
  'Whole path': 'path',
  'Per segment': 'segment'
};

const DASH_UNITS_BY_LABEL = {
  Pixels: 'pixels',
  Widths: 'widths',
  Meters: 'meters',
  Common: 'common'
};

const DASH_JUSTIFIED_BY_LABEL = {
  'Natural spacing': false,
  'Endpoint fitted': true
};

const CAP_ROUNDED_BY_LABEL = {
  Round: true,
  Square: false
};

class PathStyleYarnGlobeDemo extends Component {
  static title = 'A Globe of Yarn';

  static code = `${GITHUB_TREE}/examples/website/path-style-yarn-globe`;

  static parameters = {
    layout: {
      displayName: 'Layout',
      type: 'select',
      options: Object.keys(LAYOUT_BY_LABEL),
      value: 'Fibonacci strand'
    },
    palette: {
      displayName: 'Palette',
      type: 'select',
      options: YARN_PALETTE_NAMES,
      value: 'Vivid rainbow'
    },
    colorCycles: {
      displayName: 'Color repeats',
      type: 'range',
      value: 8,
      step: 1,
      min: 1,
      max: 24,
      accentColor: '#ee4fd1'
    },
    colorPhase: {
      displayName: 'Color phase',
      type: 'range',
      value: 0,
      step: 0.01,
      min: 0,
      max: 1,
      accentColor: '#ee4fd1'
    },
    dashMotif: {
      displayName: 'Dash motif',
      type: 'select',
      options: YARN_DASH_MOTIF_NAMES,
      value: 'Even checks'
    },
    dashMode: {
      displayName: 'Dash phase',
      type: 'select',
      options: Object.keys(DASH_MODE_BY_LABEL),
      value: 'Whole path'
    },
    dashUnits: {
      displayName: 'Dash units',
      type: 'select',
      options: Object.keys(DASH_UNITS_BY_LABEL),
      value: 'Pixels'
    },
    dashFit: {
      displayName: 'Dash fit',
      type: 'select',
      options: Object.keys(DASH_JUSTIFIED_BY_LABEL),
      value: 'Natural spacing'
    },
    dashScale: {
      displayName: 'Dash length',
      type: 'range',
      value: 1,
      step: 0.05,
      min: 0.25,
      max: 3,
      accentColor: '#2ac7ef'
    },
    gapScale: {
      displayName: 'Gap length',
      type: 'range',
      value: 1,
      step: 0.05,
      min: 0.25,
      max: 3,
      accentColor: '#2ac7ef'
    },
    strands: {
      displayName: 'Winding density',
      type: 'range',
      value: 377,
      step: 8,
      min: 65,
      max: 985,
      accentColor: '#8b62ff'
    },
    depth: {
      displayName: 'Depth spacing',
      type: 'range',
      value: 1,
      step: 0.05,
      min: 0.25,
      max: 2.5,
      accentColor: '#8b62ff'
    },
    offset: {
      displayName: 'Lateral offset',
      type: 'range',
      value: 0,
      step: 0.05,
      min: -2,
      max: 2,
      accentColor: '#8b62ff'
    },
    thickness: {
      displayName: 'Thread thickness',
      type: 'range',
      value: 1,
      step: 0.05,
      min: 0.65,
      max: 1.6,
      accentColor: '#8b62ff'
    },
    caps: {
      displayName: 'Caps',
      type: 'select',
      options: Object.keys(CAP_ROUNDED_BY_LABEL),
      value: 'Round'
    },
    spin: {displayName: 'Rotate', type: 'checkbox', value: true},
    spinSpeed: {
      displayName: 'Rotation speed',
      type: 'range',
      value: 1,
      step: 0.05,
      min: 0.25,
      max: 3,
      accentColor: '#ffb537'
    }
  };

  static renderInfo() {
    return (
      <div>
        <p>
          Follow one continuous winding inspired by{' '}
          <a href="https://github.com/shuding/cobe">Cobe's spherical Fibonacci mapping</a> through a
          repeating palette, then tune its dash phase, units, spacing, depth, and geometry.
        </p>
        <p>
          Layered showcase restores the nested yarn sculpture and its 16 simultaneous dash-style
          combinations. Its style selectors primarily shape the Fibonacci strand; density, dash
          and gap scale, thickness, and motion remain live in both layouts.
        </p>
        <p>Hover a thread for its settings; drag to orbit and scroll or pinch to zoom.</p>
      </div>
    );
  }

  render() {
    const {params, mapStyle, ...otherProps} = this.props;
    return (
      <App
        {...otherProps}
        layoutMode={LAYOUT_BY_LABEL[params.layout.value]}
        paletteName={params.palette.value}
        colorCycles={params.colorCycles.value}
        colorPhase={params.colorPhase.value}
        dashMotif={params.dashMotif.value}
        dashMode={DASH_MODE_BY_LABEL[params.dashMode.value]}
        dashUnits={DASH_UNITS_BY_LABEL[params.dashUnits.value]}
        dashJustified={DASH_JUSTIFIED_BY_LABEL[params.dashFit.value]}
        dashScale={params.dashScale.value}
        gapScale={params.gapScale.value}
        strandCount={params.strands.value}
        depthScale={params.depth.value}
        offsetScale={params.offset.value}
        thicknessScale={params.thickness.value}
        capRounded={CAP_ROUNDED_BY_LABEL[params.caps.value]}
        spin={params.spin.value}
        spinSpeed={params.spinSpeed.value}
        panelOffset
      />
    );
  }
}

export default makeExample(PathStyleYarnGlobeDemo);
