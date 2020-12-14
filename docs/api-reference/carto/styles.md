# Styles

`CARTO styles` are a set of scale functions to easily assign a color to a feature.

Transform data values into visual variables and take the advantage of [CARTOColors](https://carto.com/carto-colors/) custom color schemes.

## Color Bins

`colorBins` maps continuous numeric input to discrete values defined by the range (`colors`).

* Quantitative scales have a continuous domain.

### Usage of Color Bins

```js
import {CartoSQLLayer, colorBins} from '@deck.gl/carto';

const colorBinsManual = colorBins({
  attr: 'gn_pop',
  domain: [1e5, 2e5, 3e5],
  colors: 'Teal'
});

const binsLayer = new CartoSQLLayer({
  data: 'SELECT the_geom_webmercator, gn_pop FROM populated_places',
  getFillColor: row => colorBinsManual(row)
});
```

## Color Categories

`colorCategories` constructs ordinal scales with a discrete domain, such as a set of names or categories.

### Usage of Color Categories

```js
import {CartoSQLLayer, colorCategories} from '@deck.gl/carto';

const colorCategoriesManual = colorCategories({
  attr: 'type',
  categories: ['mid', 'major', 'military mid', 'mid and military', 'major and military'],
  colors: 'Bold'
});

const binsLayer = new CartoSQLLayer({
  data: 'SELECT the_geom_webmercator, type FROM ne_10m_airports',
  getFillColor: row => colorCategoriesManual(row)
});
```

## Color Continuous

`colorContinuous` constructs continuous linear scale where input data (`domain`) maps to specified output range (`colors`).

* Quantitative scales have a continuous domain.

### Usage of Color Continuous

```js
import {CartoSQLLayer, colorContinuous} from '@deck.gl/carto';

const colorContinuousManual = colorContinuous({
  attr: 'gn_pop',
  domain: [0, 1e5],
  colors: 'BluYl'
});

const binsLayer = new CartoSQLLayer({
  data: 'SELECT the_geom_webmercator, gn_pop FROM populated_places',
  getFillColor: row => colorContinuousManual(row)
});
```

### Arguments

#### `attr` (String) for `colorBins, colorCategories, colorContinuous`

Refers to the target property in your feature.

#### `domain` (Array) for `colorBins, colorContinuous`

Sets the scale’s domain to the specified array of values.

Remarks:
* Values must be in ascending order.
* The array must not be empty.
* The array must contain at least one value.
* `NaN`, `null` and `undefined` values are ignored and not considered part of the sample population.

#### `colors` (String | Array) for `colorBins, colorCategories, colorContinuous`

Sets the scale’s range to the specified array of values.

* If a [CARTOColors](https://carto.com/carto-colors/) color scheme name is provided, the matched one will be used.
* If an `Array` of `[r, g, b, [a]]` is passed, the function will respect those colors.

Remarks (not applicable for `colorCategories`):
* If the number of values in the scale’s domain is N, the number of values in the scale’s range must be N+1.
* If there are fewer than N+1 elements in the range, the scale may return undefined for some inputs.
* If there are more than N+1 elements in the range, the additional values are ignored.

#### `categories` (Array) for `colorCategories`

* If a [CARTOColors](https://carto.com/carto-colors/) color scheme name is provided, the matched one will be used.
* If an `Array` of `[r, g, b, [a]]` is passed, the function will respect those colors.

Remarks:
* The array must not be empty.
* The array must contain at least one string or numeric value.
* `NaN`, `null` and `undefined` values are ignored and not considered part of the sample population.
* If there are fewer or more `categories` than `colors` the fallback color for the not matched feature will be `othersColor`.

#### `othersColor` (Array, optional) for `colorCategories`

Fallback color for a category not correctly assigned.

* Default: `[119, 119, 119]`

#### `nullColor` (Array, optional) for `colorBins, colorCategories, colorContinuous`

Fallback color.

* Default: `[204, 204, 204]`

```
The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.
```

## Source