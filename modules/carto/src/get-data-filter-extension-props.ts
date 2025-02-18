import {buildFeatureFilter, FilterLogicalOperator, Filters, FilterType} from '@carto/api-client';
import {Feature} from 'geojson';

type TimeFilter = Filters['string'][FilterType.TIME] & {params?: {offsetBy?: number}};

/**
 * Creates props for {@link DataFilterExtension}, based on `@carto/api-client`
 * filter definitions.
 *
 * @privateRemarks DataFilterExtension accepts up to 4 values to filter. This
 *  implementation uses the 1st for all filters except the time filter, and the
 *  2nd for the time filter.
 */
export function getDataFilterExtensionProps(
  filters: Filters,
  filtersLogicalOperator?: FilterLogicalOperator,
  filterSize?: 0 | 1 | 2 | 3 | 4
) {
  filterSize ??= 4;
  const {filtersWithoutTimeType, timeColumn, timeFilter} = getFiltersByType(filters);
  return {
    filterRange: getFilterRange(timeFilter, filterSize),
    updateTriggers: getUpdateTriggers(filtersWithoutTimeType, timeColumn, timeFilter),
    getFilterValue: getFilterValue(
      filtersWithoutTimeType,
      timeColumn,
      timeFilter,
      filterSize,
      filtersLogicalOperator
    )
  };
}

/** @internal */
function getFiltersByType(filters: Filters) {
  const filtersWithoutTimeType: Filters = {};

  let timeColumn: string | null = null;
  let timeFilter: TimeFilter | null = null;

  for (const [column, columnData] of Object.entries(filters)) {
    for (const [type, typeData] of Object.entries(columnData) as [FilterType, unknown][]) {
      if (type === FilterType.TIME) {
        timeColumn = column;
        timeFilter = typeData as TimeFilter;
      } else {
        filtersWithoutTimeType[column] = {[type]: typeData};
      }
    }
  }

  return {
    filtersWithoutTimeType,
    timeColumn,
    timeFilter
  };
}

/** @internal */
function getFilterRange(timeFilter: TimeFilter | null, filterSize: number): number[][] {
  const result = Array(filterSize).fill([0, 0]);
  // According to getFilterValue all filters are resolved as 0 or 1 in the first position of the array
  // except the time filter value that is resolved with the real value of the feature in the second position of the array
  result[0] = [1, 1];
  if (timeFilter) {
    const offsetBy = timeFilter.params?.offsetBy || 0;
    result[1] = timeFilter.values[0].map(v => v - offsetBy);
  }
  return result;
}

/** @internal */
function getUpdateTriggers(
  filtersWithoutTimeType: Filters,
  timeColumn: string | null,
  timeFilter: TimeFilter | null
) {
  const result: Record<string, object> = {...filtersWithoutTimeType};

  // We don't want to change the layer UpdateTriggers every time that the time filter changes
  // because this filter is changed by the time series widget during its animation
  // so we remove the time filter value from the `updateTriggers`
  if (timeColumn && timeFilter) {
    result[timeColumn] = {
      ...result[timeColumn],
      offsetBy: timeFilter.params?.offsetBy,
      [FilterType.TIME]: {} // Allows working with other filters, without an impact on performance.
    };
  }
  return {
    getFilterValue: JSON.stringify(result)
  };
}

/** @internal */
function getFilterValue(
  filtersWithoutTimeType: Filters,
  timeColumn: string | null,
  timeFilter: TimeFilter | null,
  filterSize: number,
  filtersLogicalOperator?: FilterLogicalOperator
) {
  const result = Array(filterSize).fill(0);
  const featureFilter = buildFeatureFilter({
    filters: filtersWithoutTimeType,
    type: 'number',
    filtersLogicalOperator
  });

  // We evaluate all filters except the time filter using _buildFeatureFilter function.
  // For the time filter, we return the value of the feature and we will change the getFilterRange result
  // every time this filter changes
  return (feature: Feature) => {
    result[0] = featureFilter(feature);

    if (timeColumn && timeFilter) {
      const offsetBy = timeFilter.params?.offsetBy || 0;
      const f = feature.properties || feature;
      result[1] = f[timeColumn] - offsetBy;
    }
    return result;
  };
}
