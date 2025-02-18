import test from 'tape-promise/tape';
import {getDataFilterExtensionProps} from '@deck.gl/carto';
import {Feature} from 'geojson';

test('getDataFilterExtensionProps#filters', t => {
  const filters = {
    storetype: {
      in: {
        values: ['Supermarket'],
        owner: 'revenueByStoreType'
      }
    },
    revenue: {
      closed_open: {
        values: [[1400000, 1500000]],
        owner: 'storesByRevenue'
      }
    }
  };
  const featurePassesFilter: Feature = {
    type: 'Feature',
    geometry: {type: 'Point', coordinates: [0, 0]},
    properties: {
      storetype: 'Supermarket',
      revenue: 1400001
    }
  };
  const featureNotFilter: Feature = {
    type: 'Feature',
    geometry: {type: 'Point', coordinates: [0, 0]},
    properties: {
      storetype: 'Supermarket',
      revenue: 100
    }
  };
  const {filterRange, updateTriggers, getFilterValue} = getDataFilterExtensionProps(filters);

  t.equals(filterRange.length, 4);

  filterRange.forEach((range, index) => {
    t.deepEquals(range, index === 0 ? [1, 1] : [0, 0]);
  });

  t.equals(updateTriggers.getFilterValue, JSON.stringify(filters));

  t.deepEquals(getFilterValue(featurePassesFilter), [1, 0, 0, 0]);
  t.deepEquals(getFilterValue(featureNotFilter), [0, 0, 0, 0]);
  t.end();
});

test('getDataFilterExtensionProps#time', t => {
  const offsetBy = 473380000000;
  const filters = {
    storetype: {
      in: {
        values: ['Supermarket'],
        owner: 'revenueByStoreType'
      }
    },
    dateTime: {
      time: {
        values: [[473385600000, 504921600000]],
        owner: 'storesByRevenue',
        params: {offsetBy}
      }
    }
  };

  const feature: Feature = {
    type: 'Feature',
    geometry: {type: 'Point', coordinates: [0, 0]},
    properties: {
      storetype: 'Supermarket',
      dateTime: 473385600001
    }
  };

  const {filterRange, updateTriggers, getFilterValue} = getDataFilterExtensionProps(filters);

  t.equals(filterRange.length, 4);

  filterRange.forEach((range, index) => {
    if (index === 0) {
      t.deepEquals(range, [1, 1]);
    } else if (index === 1) {
      t.deepEquals(
        range,
        filters.dateTime.time.values[0].map(v => v - offsetBy)
      );
    } else {
      t.deepEquals(range, [0, 0]);
    }
  });

  t.deepEquals(
    updateTriggers.getFilterValue,
    JSON.stringify({...filters, dateTime: {offsetBy, time: {}}})
  );

  t.deepEquals(getFilterValue(feature), [1, feature.properties!.dateTime - offsetBy, 0, 0]);

  t.end();
});
