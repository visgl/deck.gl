import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {TextLayer} from '@deck.gl/layers';
import {points} from 'deck.gl-test/data';

import {OS} from '../constants';

function getBinaryAttributes(data, getText, accessors) {
  const startIndices = new Uint16Array(
    data.reduce(
      (acc, d) => {
        const lastIndex = acc[acc.length - 1];
        acc.push(lastIndex + getText(d).length);
        return acc;
      },
      [0]
    )
  );

  const attributes = {};

  attributes.getText = {
    value: new Uint8Array(
      data.map(d => Array.from(getText(d)).map(char => char.charCodeAt(0))).flat()
    )
  };
  for (const accessorName in accessors) {
    const {accessor, ...props} = accessors[accessorName];
    props.value = new Float32Array(
      data
        .slice(0, 50)
        .map(d => Array.from(getText(d)).map(d1 => accessor(d)))
        .flat(2)
    );
    attributes[accessorName] = props;
  }

  return {
    length: data.length,
    startIndices,
    attributes
  };
}

export default (OS === 'Mac'
  ? [
      {
        name: 'text-layer',
        viewState: {
          latitude: 37.751,
          longitude: -122.427,
          zoom: 11.5,
          pitch: 0,
          bearing: 0
        },
        layers: [
          new TextLayer({
            id: 'text-layer',
            data: points.slice(0, 50),
            fontFamily: 'Arial',
            getText: x => `${x.PLACEMENT}-${x.YR_INSTALLED}`,
            getPosition: x => x.COORDINATES,
            getColor: x => [255, 0, 0],
            getSize: x => 32,
            getAngle: x => 0,
            sizeScale: 1,
            getTextAnchor: x => 'start',
            getAlignmentBaseline: x => 'center',
            getPixelOffset: x => [10, 0]
          })
        ],
        goldenImage: './test/render/golden-images/text-layer.png'
      },
      {
        name: 'text-layer-meter-size',
        viewState: {
          latitude: 37.751,
          longitude: -122.427,
          zoom: 11.5,
          pitch: 0,
          bearing: 0
        },
        layers: [
          new TextLayer({
            id: 'text-layer',
            data: points.slice(0, 50),
            fontFamily: 'Arial',
            getText: x => `${x.PLACEMENT}-${x.YR_INSTALLED}`,
            getPosition: x => x.COORDINATES,
            getColor: x => [255, 0, 0],
            getSize: x => 32,
            getAngle: x => 0,
            sizeScale: 21.343755,
            sizeUnits: 'meters',
            getTextAnchor: x => 'start',
            getAlignmentBaseline: x => 'center',
            getPixelOffset: x => [10, 0]
          })
        ],
        goldenImage: './test/render/golden-images/text-layer.png'
      },
      {
        name: 'text-layer-binary',
        viewState: {
          latitude: 37.751,
          longitude: -122.427,
          zoom: 11.5,
          pitch: 0,
          bearing: 0
        },
        layers: [
          new TextLayer({
            id: 'text-layer',
            data: getBinaryAttributes(
              points.slice(0, 50),
              x => `${x.PLACEMENT}-${x.YR_INSTALLED}`,
              {
                getPosition: {accessor: x => x.COORDINATES, size: 2},
                getColor: {accessor: x => [1, 0, 0], size: 3, normalized: false}
              }
            ),
            fontFamily: 'Arial',
            getSize: 32,
            getAngle: 0,
            sizeScale: 1,
            getTextAnchor: 'start',
            getAlignmentBaseline: 'center',
            getPixelOffset: [10, 0]
          })
        ],
        goldenImage: './test/render/golden-images/text-layer.png'
      },
      {
        name: 'text-layer-multi-lines',
        viewState: {
          latitude: 37.75,
          longitude: -122.44,
          zoom: 11.5,
          pitch: 0,
          bearing: 0
        },
        layers: [
          new TextLayer({
            id: 'text-layer',
            data: points.slice(0, 10),
            coordinateOrigin: [-122.44, 37.75],
            coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
            fontFamily: 'Arial',
            getText: x => `${x.ADDRESS}\n${x.SPACES}`,
            getPosition: (_, {index}) => [0, (index - 5) * 1000],
            getColor: [255, 0, 0],
            getSize: 32,
            getTextAnchor: 'middle',
            getAlignmentBaseline: 'center'
          })
        ],
        goldenImage: './test/render/golden-images/text-layer-multi-lines.png'
      },
      {
        name: 'text-layer-auto-wrapping',
        viewState: {
          latitude: 37.75,
          longitude: -122.44,
          zoom: 11.5,
          pitch: 0,
          bearing: 0
        },
        layers: [
          new TextLayer({
            id: 'text-layer',
            data: points.slice(0, 5),
            coordinateOrigin: [-122.44, 37.75],
            coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
            fontFamily: 'Arial',
            wordBreak: 'break-word',
            maxWidth: 1000,
            getText: x => `${x.LOCATION_NAME} ${x.ADDRESS}`,
            getPosition: (_, {index}) => [0, (index - 2) * 2000],
            getColor: [255, 0, 0],
            getSize: 32,
            getTextAnchor: 'middle',
            getAlignmentBaseline: 'center'
          })
        ],
        goldenImage: './test/render/golden-images/text-layer-auto-wrapping.png'
      },
      {
        name: 'text-layer-background',
        viewState: {
          latitude: 37.75,
          longitude: -122.44,
          zoom: 11.5,
          pitch: 0,
          bearing: 0
        },
        layers: [
          new TextLayer({
            id: 'text-layer',
            data: points.slice(0, 10),
            coordinateOrigin: [-122.44, 37.75],
            coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
            fontFamily: 'Arial',
            backgroundColor: [255, 255, 0, 200],
            getText: x => `${x.ADDRESS}-${x.SPACES}`,
            getPosition: (_, {index}) => [0, (index - 5) * 1000],
            getColor: [255, 0, 0],
            getSize: 32,
            getTextAnchor: 'start',
            getAlignmentBaseline: 'center'
          })
        ],
        goldenImage: './test/render/golden-images/text-layer-background.png'
      }
    ]
  : []);
