import {CPUGridLayer} from 'deck.gl';
import {
  getColorValueDomain,
  getColorScaleFunction,
  getElevationScaleFunction
} from '../utils/enhanced-cpu-grid';

const defaultProps = {
  ...CPUGridLayer.defaultProps,
  sizeScale: 'linear',
  colorScaleType: 'ordinal'
};

export default class EnhancedCPUGridLayer extends CPUGridLayer {
  getDimensionUpdaters() {
    const dimensionUpdaters = super.getDimensionUpdaters();
    // add colorScale and sizeScale to dimension updates
    dimensionUpdaters.getFillColor[1].triggers.push('colorScale');
    dimensionUpdaters.getElevation[1].triggers.push('sizeScale');
    return dimensionUpdaters;
  }

  /*
   * override default layer method to calculate color domain
   * and scale function base on color scale type
   */
  getColorValueDomain() {
    getColorValueDomain(this);
  }

  getColorScale() {
    getColorScaleFunction(this);
  }

  getElevationScale() {
    getElevationScaleFunction(this);
  }
}

EnhancedCPUGridLayer.layerName = 'EnhancedGridLayer';
EnhancedCPUGridLayer.defaultProps = defaultProps;
