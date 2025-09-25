// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable @typescript-eslint/no-shadow */

import type {ShaderModule} from '@luma.gl/shadertools';
import {getResolution} from 'quadbin';
import {getResolution as getH3Resolution, getNumCells} from 'h3-js';

import {
  Accessor,
  Color,
  CompositeLayer,
  CompositeLayerProps,
  _deepEqual as deepEqual,
  DefaultProps,
  Layer,
  UpdateParameters
} from '@deck.gl/core';
import {SolidPolygonLayer} from '@deck.gl/layers';

import {HeatmapProps, heatmap} from './heatmap';
import {RTTModifier, PostProcessModifier} from './post-process-utils';
import QuadbinTileLayer, {QuadbinTileLayerProps} from './quadbin-tile-layer';
import H3TileLayer, {H3TileLayerProps} from './h3-tile-layer';
import {TilejsonPropType} from './utils';
import {TilejsonResult} from '@carto/api-client';
import {_Tile2DHeader as Tile2DHeader} from '@deck.gl/geo-layers';
import {Texture, TextureProps} from '@luma.gl/core';

const defaultColorRange: Color[] = [
  [255, 255, 178],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [240, 59, 32],
  [189, 0, 38]
];

const TEXTURE_PROPS: TextureProps = {
  format: 'rgba8unorm',
  dimension: '2d',
  width: 1,
  height: 1,
  sampler: {
    minFilter: 'linear',
    magFilter: 'linear',
    addressModeU: 'clamp-to-edge',
    addressModeV: 'clamp-to-edge'
  }
};
/**
 * Computes the unit density for Quadbin cells.
 * The unit density is the number of cells needed to cover the Earth's surface at a given resolution. It is inversely proportional to the cell area.
 */
function unitDensityForQuadbinCell(cell: bigint) {
  const cellResolution = Number(getResolution(cell));
  return Math.pow(4.0, cellResolution);
}

/**
 * Computes the unit density for H3 cells.
 * The unit density is the number of cells needed to cover the Earth's surface at a given resolution. It is inversely proportional to the cell area.
 */
function unitDensityForH3Cell(cellId: string) {
  const cellResolution = Number(getH3Resolution(cellId));
  return getNumCells(cellResolution);
}

/**
 * Converts a colorRange array to a flat array with 4 components per color
 */
function colorRangeToFlatArray(colorRange: Color[]): Uint8Array {
  const flatArray = new Uint8Array(colorRange.length * 4);
  let index = 0;

  for (let i = 0; i < colorRange.length; i++) {
    const color = colorRange[i];
    flatArray[index++] = color[0];
    flatArray[index++] = color[1];
    flatArray[index++] = color[2];
    flatArray[index++] = Number.isFinite(color[3]) ? (color[3] as number) : 255;
  }

  return flatArray;
}

const uniformBlock = `\
uniform densityUniforms {
  float factor;
} density;
`;

type DensityProps = {factor: number};
const densityUniforms = {
  name: 'density',
  vs: uniformBlock,
  uniformTypes: {
    factor: 'f32'
  }
} as const satisfies ShaderModule<DensityProps>;

// Modified polygon layer to draw offscreen and output value expected by heatmap
class RTTSolidPolygonLayer extends RTTModifier(SolidPolygonLayer) {
  static layerName = 'RTTSolidPolygonLayer';

  getShaders(type) {
    const shaders = super.getShaders(type);
    shaders.inject = {
      'vs:#main-end': `
      // Value from getWeight accessor
  float weight = elevations;

  // Keep "power" delivered to screen constant when tiles update
  // by outputting normalized density
  weight *= density.factor;

  // Pack float into 3 channels to pass to heatmap shader
  // SCALE value important, as we don't want to saturate
  // but also want enough definition to avoid banding
  const vec3 SHIFT = vec3(1.0, 256.0, 256.0 * 256.0);
  const float MAX_VAL = SHIFT.z * 255.0;
  const float SCALE = MAX_VAL / 8.0;
  weight *= SCALE;
  weight = clamp(weight, 0.0, MAX_VAL);
  vColor = vec4(mod(vec3(weight, floor(weight / SHIFT.yz)), 256.0), 255.0) / 255.0;
`
    };
    shaders.modules = [...shaders.modules, densityUniforms];
    return shaders;
  }

  draw(this, opts: any) {
    const cell = this.props!.data[0];
    if (cell) {
      const maxDensity = this.props.elevationScale;
      const {scheme} = this.parent.parent.parent.parent.parent.state;
      const unitDensity =
        scheme === 'h3' ? unitDensityForH3Cell(cell.id) : unitDensityForQuadbinCell(cell.id);
      const densityProps: DensityProps = {factor: unitDensity / maxDensity};
      for (const model of this.state.models) {
        model.shaderInputs.setProps({density: densityProps});
      }
    }

    super.draw(opts);
  }
}

// Modify QuadbinTileLayer to apply heatmap post process effect
const PostProcessQuadbinTileLayer = PostProcessModifier(QuadbinTileLayer, heatmap);

// Modify H3TileLayer to apply heatmap post process effect
const PostProcessH3TileLayer = PostProcessModifier(H3TileLayer, heatmap);

const defaultProps: DefaultProps<HeatmapTileLayerProps> = {
  data: TilejsonPropType,
  getWeight: {type: 'accessor', value: 1},
  onMaxDensityChange: {type: 'function', optional: true, value: null},
  colorDomain: {type: 'array', value: [0, 1]},
  colorRange: defaultColorRange,
  intensity: {type: 'number', value: 1},
  radiusPixels: {type: 'number', min: 0, max: 100, value: 20}
};

/** All properties supported by HeatmapTileLayer. */
export type HeatmapTileLayerProps<DataT = unknown> = _HeatmapTileLayerProps<DataT> &
  CompositeLayerProps & {
    data: null | TilejsonResult | Promise<TilejsonResult>;
  };

/** Properties added by HeatmapTileLayer. */
type _HeatmapTileLayerProps<DataT> = (QuadbinTileLayerProps<DataT> | H3TileLayerProps<DataT>) &
  HeatmapProps & {
    /**
     * Specified as an array of colors [color1, color2, ...].
     *
     * @default `6-class YlOrRd` - [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6)
     */
    colorRange: Color[];

    /**
     * The weight of each object.
     *
     * @default 1
     */
    getWeight?: Accessor<DataT, number>;

    /** Called when maximum density in displayed tiles changes. */
    onMaxDensityChange?: ((maxDensity: number) => void) | null;
  };

class HeatmapTileLayer<DataT = any, ExtraProps extends {} = {}> extends CompositeLayer<
  ExtraProps & Required<_HeatmapTileLayerProps<DataT>>
> {
  static layerName = 'HeatmapTileLayer';
  static defaultProps = defaultProps;

  state!: {
    colorTexture?: Texture;
    isLoaded: boolean;
    scheme: string | null;
    tiles: Set<Tile2DHeader>;
    viewportChanged?: boolean;
  };
  initializeState() {
    this.state = {
      isLoaded: false,
      scheme: null,
      tiles: new Set(),
      viewportChanged: false
    };
  }

  shouldUpdateState({changeFlags}): boolean {
    const {viewportChanged} = changeFlags;
    this.setState({viewportChanged});
    return changeFlags.somethingChanged;
  }

  updateState(opts: UpdateParameters<this>) {
    const {props, oldProps} = opts;
    super.updateState(opts);
    if (!deepEqual(props.colorRange, oldProps.colorRange, 2)) {
      this._updateColorTexture(opts);
    }

    const scheme = props.data && 'scheme' in props.data ? props.data.scheme : null;
    if (this.state.scheme !== scheme) {
      this.setState({scheme});
      this.state.tiles.clear();
    }
  }

  renderLayers(): Layer {
    const {
      data,
      getWeight,
      colorDomain,
      intensity,
      radiusPixels,
      _subLayerProps,
      updateTriggers,
      onMaxDensityChange,
      onViewportLoad,
      onTileLoad,
      onTileUnload,
      ...tileLayerProps
    } = this.props;

    const isH3 = this.state.scheme === 'h3';

    const cellLayerName = isH3 ? 'hexagon-cell-hifi' : 'cell';
    // Inject modified polygon layer as sublayer into TileLayer
    const subLayerProps = {
      ..._subLayerProps,
      [cellLayerName]: {
        ..._subLayerProps?.[cellLayerName],
        _subLayerProps: {
          ..._subLayerProps?.[cellLayerName]?._subLayerProps,
          fill: {
            ..._subLayerProps?.[cellLayerName]?._subLayerProps?.fill,
            type: RTTSolidPolygonLayer
          }
        }
      }
    };

    let tileZ = 0;
    let maxDensity = 0;
    const loadedTiles = [...this.state.tiles].filter(t => t.content);
    const visibleTiles = loadedTiles.filter(t => t.isVisible);

    // As deck.gl initially marks tiles as hidden, use hidden tiles as fallback for calculation.
    // This avoids an ugly flash/glitch at startup when layer is first rendered
    const tiles = visibleTiles.length ? visibleTiles : loadedTiles;

    for (const tile of tiles) {
      const cell = tile.content[0];
      const unitDensity = isH3 ? unitDensityForH3Cell(cell.id) : unitDensityForQuadbinCell(cell.id);
      maxDensity = Math.max(tile.userData!.maxWeight * unitDensity, maxDensity);
      tileZ = Math.max(tile.zoom, tileZ);
    }

    // Between zoom levels the max density will change, but it isn't possible to know by what factor.
    // As a heuristic, an estimatedGrowthFactor makes the transitions less obvious.
    // For quadbin, uniform data distributions lead to an estimatedGrowthFactor of 4, while very localized data gives 1.
    // For H3 the same logic applies but the aperture is 7, rather than 4, so a slightly higher estimatedGrowthFactor is used.
    let overzoom: number;
    let estimatedGrowthFactor: number;
    if (isH3) {
      // For H3, we need to account for the viewport zoom to H3 resolution mapping (see getHexagonResolution())
      overzoom = (2 / 3) * this.context.viewport.zoom - tileZ - 2.25;
      estimatedGrowthFactor = 2.2;
    } else {
      overzoom = this.context.viewport.zoom - tileZ;
      estimatedGrowthFactor = 2;
    }

    maxDensity = maxDensity * Math.pow(estimatedGrowthFactor, overzoom);
    if (typeof onMaxDensityChange === 'function') {
      onMaxDensityChange(maxDensity);
    }
    const PostProcessTileLayer = isH3 ? PostProcessH3TileLayer : PostProcessQuadbinTileLayer;
    const layerProps = isH3
      ? (tileLayerProps as Omit<H3TileLayerProps, 'data'>)
      : (tileLayerProps as Omit<QuadbinTileLayerProps, 'data'>);

    return new PostProcessTileLayer(
      layerProps,
      this.getSubLayerProps({
        id: 'heatmap',
        data,

        // Re-use existing props to pass down values to sublayer
        // TODO replace with custom layer
        getFillColor: 0,
        getElevation: getWeight,
        elevationScale: maxDensity,

        colorDomain,

        radiusPixels,
        intensity,
        _subLayerProps: subLayerProps,
        refinementStrategy: 'no-overlap',

        colorTexture: this.state.colorTexture,

        // Disable line rendering
        extruded: false,
        stroked: false,

        updateTriggers: {
          getElevation: updateTriggers.getWeight
        },

        // Tile stats
        onViewportLoad: tiles => {
          this.setState({isLoaded: true});
          if (typeof onViewportLoad === 'function') {
            onViewportLoad(tiles);
          }
        },
        onTileLoad: (tile: Tile2DHeader) => {
          let maxWeight = -Infinity;
          if (typeof getWeight !== 'function') {
            maxWeight = getWeight;
          } else if (tile.content) {
            for (const d of tile.content) {
              maxWeight = Math.max(getWeight(d, {} as any), maxWeight);
            }
          }
          tile.userData = {maxWeight};

          this.state.tiles.add(tile);

          if (typeof onTileLoad === 'function') {
            onTileLoad(tile);
          }
        },
        onTileUnload: (tile: Tile2DHeader) => {
          this.state.tiles.delete(tile);
          if (typeof onTileUnload === 'function') {
            onTileUnload(tile);
          }
        },
        transitions: {elevationScale: {type: 'spring', stiffness: 0.3, damping: 0.5}}
      })
    );
  }

  _updateColorTexture(opts) {
    const {colorRange} = opts.props;
    let {colorTexture} = this.state;
    const colors = colorRangeToFlatArray(colorRange);

    colorTexture?.destroy();
    colorTexture = this.context.device.createTexture({
      ...TEXTURE_PROPS,
      data: colors,
      width: colorRange.length,
      height: 1
    });

    this.setState({colorTexture});
  }
}

export default HeatmapTileLayer;
