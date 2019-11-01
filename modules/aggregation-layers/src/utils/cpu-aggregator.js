// Copyright (c) 2015 - 2018 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
import BinSorter from './bin-sorter';
import {getQuantizeScale, getLinearScale, getQuantileScale, getOrdinalScale} from './scale-utils';
import {getValueFunc} from './aggregation-operation-utils';

function nop() {}

const dimensionSteps = ['getBins', 'getDomain', 'getScaleFunc'];
const defaultDimensions = [
  {
    key: 'fillColor',
    accessor: 'getFillColor',
    pickingInfo: 'colorValue',
    getBins: {
      triggers: {
        value: {
          prop: 'getColorValue',
          updateTrigger: 'getColorValue'
        },
        weight: {
          prop: 'getColorWeight',
          updateTrigger: 'getColorWeight'
        },
        aggregation: {
          prop: 'colorAggregation'
        }
      }
    },
    getDomain: {
      triggers: {
        lowerPercentile: {
          prop: 'lowerPercentile'
        },
        upperPercentile: {
          prop: 'upperPercentile'
        }
      },
      onSet: {
        props: 'onSetColorDomain'
      }
    },
    getScaleFunc: {
      triggers: {
        domain: {prop: 'colorDomain'},
        range: {prop: 'colorRange'},
        scaleType: {prop: 'colorScaleType'}
      }
    },
    nullValue: [0, 0, 0, 0]
  },
  {
    key: 'elevation',
    accessor: 'getElevation',
    pickingInfo: 'elevationValue',
    getBins: {
      triggers: {
        value: {
          prop: 'getElevationValue',
          updateTrigger: 'getElevationValue'
        },
        weight: {
          prop: 'getElevationWeight',
          updateTrigger: 'getElevationWeight'
        },
        aggregation: {
          prop: 'elevationAggregation'
        }
      }
    },
    getDomain: {
      triggers: {
        lowerPercentile: {
          prop: 'elevationLowerPercentile'
        },
        upperPercentile: {
          prop: 'elevationUpperPercentile'
        }
      },
      onSet: {
        props: 'onSetElevationDomain'
      }
    },
    getScaleFunc: {
      triggers: {
        domain: {prop: 'elevationDomain'},
        range: {prop: 'elevationRange'},
        scaleType: {prop: 'elevationScaleType'}
      }
    },
    nullValue: -1
  }
];
const defaultGetCellSize = props => props.cellSize;
export default class CPUAggregator {
  constructor(opts) {
    this.state = {
      layerData: {},
      dimensions: {
        // color: {
        //   getValue: null,
        //   domain: null,
        //   sortedBins: null,
        //   scaleFunc: nop
        // },
        // elevation: {
        //   getValue: null,
        //   domain: null,
        //   sortedBins: null,
        //   scaleFunc: nop
        // }
      }
    };
    this.changeFlags = {};
    this.dimensionUpdaters = {};

    this._getCellSize = opts.getCellSize || defaultGetCellSize;
    this._getAggregator = opts.getAggregator;
    this._addDimension(opts.dimensions || defaultDimensions);
  }

  static defaultDimensions() {
    return defaultDimensions;
  }

  updateState({oldProps, props, changeFlags}, viewport) {
    this.updateGetValueFuncs(oldProps, props, changeFlags);
    const reprojectNeeded = this.needsReProjectPoints(oldProps, props, changeFlags);

    if (changeFlags.dataChanged || reprojectNeeded) {
      // project data into hexagons, and get sortedColorBins
      this.getAggregatedData(props, viewport);
    } else {
      const dimensionChanges = this.getDimensionChanges(oldProps, props, changeFlags) || [];
      // this here is layer
      dimensionChanges.forEach(f => typeof f === 'function' && f());
    }

    return this.state;
  }

  // Update private state
  setState(updateObject) {
    this.state = Object.assign({}, this.state, updateObject);
  }

  // Update private state.dimensions
  setDimensionState(key, updateObject) {
    this.setState({
      dimensions: Object.assign({}, this.state.dimensions, {
        [key]: Object.assign({}, this.state.dimensions[key], updateObject)
      })
    });
  }

  normalizeResult(result = {}) {
    // support previous hexagonAggregator API
    if (result.hexagons) {
      return Object.assign({data: result.hexagons}, result);
    } else if (result.layerData) {
      return Object.assign({data: result.layerData}, result);
    }

    return result;
  }

  getAggregatedData(props, viewport) {
    const aggregator = this._getAggregator(props);

    // result should contain a data array and other props
    // result = {data: [], ...other props}
    const result = aggregator(props, viewport);
    this.setState({
      layerData: this.normalizeResult(result)
    });
    this.changeFlags = {
      layerData: true
    };
    this.getSortedBins(props);
  }

  updateGetValueFuncs(oldProps, props, changeFlags) {
    for (const key in this.dimensionUpdaters) {
      const {value, weight, aggregation} = this.dimensionUpdaters[key].getBins.triggers;
      let getValue = props[value.prop];
      const getValueChanged = this.needUpdateDimensionStep(
        this.dimensionUpdaters[key].getBins,
        oldProps,
        props,
        changeFlags
      );

      if (getValueChanged && getValue === null) {
        // If `getValue` is not provided from props, build it with aggregation and weight.
        getValue = getValueFunc(props[aggregation.prop], props[weight.prop]);
      }

      if (getValue) {
        this.setDimensionState(key, {getValue});
      }
    }
  }

  needsReProjectPoints(oldProps, props, changeFlags) {
    return (
      this._getCellSize(oldProps) !== this._getCellSize(props) ||
      this._getAggregator(oldProps) !== this._getAggregator(props) ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPosition))
    );
  }

  // Adds dimensions
  addDimension(dimensions) {
    this._addDimension(dimensions);
  }

  _addDimension(dimensions = []) {
    dimensions.forEach(dimension => {
      const {key} = dimension;
      this.dimensionUpdaters[key] = this.getDimensionUpdaters(dimension);
      this.state.dimensions[key] = {
        getValue: null,
        domain: null,
        sortedBins: null,
        scaleFunc: nop
      };
    });
  }

  getDimensionUpdaters({key, accessor, pickingInfo, getBins, getDomain, getScaleFunc, nullValue}) {
    return {
      key,
      accessor,
      pickingInfo,
      getBins: Object.assign({updater: this.getDimensionSortedBins}, getBins),
      getDomain: Object.assign({updater: this.getDimensionValueDomain}, getDomain),
      getScaleFunc: Object.assign({updater: this.getDimensionScale}, getScaleFunc),
      attributeAccessor: this.getSubLayerDimensionAttribute(key, nullValue)
    };
  }

  needUpdateDimensionStep(dimensionStep, oldProps, props, changeFlags) {
    // whether need to update current dimension step
    // dimension step is the value, domain, scaleFunction of each dimension
    // each step is an object with properties links to layer prop and whether the prop is
    // controlled by updateTriggers
    // getBins: {
    //   value: {
    //     prop: 'getElevationValue',
    //     updateTrigger: 'getElevationValue'
    //   },
    //   weight: {
    //     prop: 'getElevationWeight',
    //     updateTrigger: 'getElevationWeight'
    //   },
    //   aggregation: {
    //     prop: 'elevationAggregation'
    //   }
    // }
    return Object.values(dimensionStep.triggers).some(item => {
      if (item.updateTrigger) {
        // check based on updateTriggers change first
        return (
          changeFlags.updateTriggersChanged &&
          (changeFlags.updateTriggersChanged.all ||
            changeFlags.updateTriggersChanged[item.updateTrigger])
        );
      }
      // fallback to direct comparison
      return oldProps[item.prop] !== props[item.prop];
    });
  }

  getDimensionChanges(oldProps, props, changeFlags) {
    // const {dimensionUpdaters} = this.state;
    const updaters = [];

    // get dimension to be updated
    for (const key in this.dimensionUpdaters) {
      // return the first triggered updater for each dimension
      const needUpdate = dimensionSteps.find(step =>
        this.needUpdateDimensionStep(
          this.dimensionUpdaters[key][step],
          oldProps,
          props,
          changeFlags
        )
      );

      if (needUpdate) {
        updaters.push(
          this.dimensionUpdaters[key][needUpdate].updater.bind(
            this,
            props,
            this.dimensionUpdaters[key]
          )
        );
      }
    }

    return updaters.length ? updaters : null;
  }

  getUpdateTriggers(props) {
    const _updateTriggers = props.updateTriggers || {};
    const updateTriggers = {};

    for (const key in this.dimensionUpdaters) {
      const {accessor} = this.dimensionUpdaters[key];
      // fold dimension triggers into each accessor
      updateTriggers[accessor] = {};

      dimensionSteps.forEach(step => {
        Object.values(this.dimensionUpdaters[key][step].triggers).forEach(
          ({prop, updateTrigger}) => {
            if (updateTrigger) {
              // if prop is based on updateTrigger e.g. getColorValue, getColorWeight
              // and updateTriggers is passed in from layer prop
              // fold the updateTriggers into accessor
              const fromProp = _updateTriggers[updateTrigger];
              if (typeof fromProp === 'object' && !Array.isArray(fromProp)) {
                // if updateTrigger is an object spread it
                Object.assign(updateTriggers[accessor], fromProp);
              } else if (fromProp !== undefined) {
                updateTriggers[accessor][prop] = fromProp;
              }
            } else {
              // if prop is not based on updateTrigger
              updateTriggers[accessor][prop] = props[prop];
            }
          }
        );
      });
    }

    return updateTriggers;
  }

  getScaleFunctionByScaleType(scaleType) {
    switch (scaleType) {
      case 'quantize':
        return getQuantizeScale;
      case 'linear':
        return getLinearScale;
      case 'quantile':
        return getQuantileScale;
      case 'ordinal':
        return getOrdinalScale;

      default:
        return getQuantizeScale;
    }
  }

  getSortedBins(props) {
    for (const key in this.dimensionUpdaters) {
      this.getDimensionSortedBins(props, this.dimensionUpdaters[key]);
    }
  }

  getDimensionSortedBins(props, dimensionUpdater) {
    // const {getColorValue} = this.state;
    const {key} = dimensionUpdater;
    const {getValue} = this.state.dimensions[key];

    const sortedBins = new BinSorter(this.state.layerData.data || [], getValue);
    this.setDimensionState(key, {sortedBins});
    this.getDimensionValueDomain(props, dimensionUpdater);
  }

  getDimensionValueDomain(props, dimensionUpdater) {
    const {getDomain, key} = dimensionUpdater;
    const {
      triggers: {lowerPercentile, upperPercentile},
      onSet
    } = getDomain;
    const valueDomain = this.state.dimensions[key].sortedBins.getValueRange([
      props[lowerPercentile.prop],
      props[upperPercentile.prop]
    ]);

    if (typeof onSet === 'object' && typeof props[onSet.props] === 'function') {
      props[onSet.props](valueDomain);
    }

    this.setDimensionState(key, {valueDomain});
    this.getDimensionScale(props, dimensionUpdater);
  }

  getDimensionScale(props, dimensionUpdater) {
    const {key, getScaleFunc} = dimensionUpdater;
    const {domain, range, scaleType} = getScaleFunc.triggers;
    // const {colorRange} = key;
    const dimensionRange = props[range.prop];
    const dimensionDomain = props[domain.prop] || this.state.dimensions[key].valueDomain;
    const getScaleFunction = this.getScaleFunctionByScaleType(props[scaleType.prop]);
    const scaleFunc = getScaleFunction(dimensionDomain, dimensionRange);

    this.setDimensionState(key, {scaleFunc});
  }

  getSubLayerDimensionAttribute(key, nullValue) {
    return cell => {
      const {sortedBins, scaleFunc} = this.state.dimensions[key];

      const cv = sortedBins.binMap[cell.index] && sortedBins.binMap[cell.index].value;
      const domain = scaleFunc.domain();

      const isValueInDomain = cv >= domain[0] && cv <= domain[domain.length - 1];

      // if cell value is outside domain, set alpha to 0
      return isValueInDomain ? scaleFunc(cv) : nullValue;
    };
  }

  getSubLayerAccessors(props) {
    const accessors = {};
    for (const key in this.dimensionUpdaters) {
      const {accessor} = this.dimensionUpdaters[key];
      accessors[accessor] = this.getSubLayerDimensionAttribute(props, key);
    }

    return accessors;
  }

  getPickingInfo({info}) {
    const isPicked = info.picked && info.index > -1;
    let object = null;

    if (isPicked) {
      // const {sortedColorBins, sortedElevationBins} = this.state;

      const cell = this.state.layerData.data[info.index];

      const binInfo = {};
      for (const key in this.dimensionUpdaters) {
        const {pickingInfo} = this.dimensionUpdaters[key];
        const {sortedBins} = this.state.dimensions[key];
        const value = sortedBins.binMap[cell.index] && sortedBins.binMap[cell.index].value;
        binInfo[pickingInfo] = value;
      }

      object = Object.assign(binInfo, cell);
    }

    // add bin colorValue and elevationValue to info
    return Object.assign(info, {
      picked: Boolean(object),
      // override object with picked cell
      object
    });
  }

  getAccessor(dimensionKey) {
    if (!this.dimensionUpdaters.hasOwnProperty(dimensionKey)) {
      return nop;
    }
    return this.dimensionUpdaters[dimensionKey].attributeAccessor;
  }
}
