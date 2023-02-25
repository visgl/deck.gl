# Styles

Helper functions to create data-driven map visualizations.

These helpers take advantage of [CARTOColors](https://carto.com/carto-colors/), custom color schemes built on top of well-known standards for color use on maps, with next generation enhancements for the web and CARTO basemaps.

## colorBins

Helper function for quickly creating a color bins style based on [d3 scaleThreshold](https://github.com/d3/d3-scale/blob/main/README.md#scaleThreshold).

Data values of each attribute are rounded down to the nearest value in the domain and are then styled with the corresponding color.

```javascript
new CartoLayer({
  type: MAP_TYPES.QUERY,
  data: 'SELECT the_geom_webmercator, gn_pop FROM populated_places',
  getFillColor: colorBins({
    attr: 'gn_pop',
    domain: [1e5, 2e5, 3e5],
    colors: 'Teal'
  })
});
```

In this example, using `Teal` of length `domain.length + 1`, the range/color equivalence is:

```
[, 1e5)     -> Teal[0]
[1e5, 2e5)  -> Teal[1]
[2e5, 3e5)  -> Teal[2]
[3e5,]      -> Teal[3]
```

### Arguments

#### `attr` (String) {#attr}

Attribute or column to symbolize by.

#### `domain` (Array) {#domain}

Assign manual class break values.

#### `colors` (String | Array, optional) {#colors}

Color assigned to each domain value.

- String: A valid named [CARTOColors](https://carto.com/carto-colors/) palette.
- Array: Array of colors in RGBA `[ [r, g, b, [a]] ]`. 

Default: `PurpOr`

#### `nullColor` (Array, optional) {#nullcolor}

Color for null values.

Default: `[204, 204, 204]`

## colorCategories

Helper function for quickly creating a color category style.

Data values of each attribute listed in the domain are mapped one to one with corresponding colors in the range.

```javascript
new CartoLayer({
  type: MAP_TYPES.QUERY,
  data: 'SELECT the_geom_webmercator, type FROM ne_10m_airports',
  getFillColor: colorCategories({
    attr: 'type',
    domain: ['mid', 'major', 'military mid', 'mid and military', 'major and military'],
    colors: 'Bold'
  })
});
```

### Arguments

#### `attr` (String) {#attr}

Attribute or column to symbolize by.

#### `domain` (Array) {#domain}

Category list. Must be a valid list of categories.

#### `colors` (String | Array, optional) {#colors}

Color assigned to each domain value.

- String: A valid named [CARTOColors](https://carto.com/carto-colors/) palette.
- Array: Array of colors in RGBA `[ [r, g, b, [a]] ]`. 

Default: `PurpOr`

#### `nullColor` (Array, optional) {#nullcolor}

Color for null values.

Default: `[204, 204, 204]`

#### `othersColor` (Array, optional) {#otherscolor}

Fallback color for a category not correctly assigned.

Default: `[119, 119, 119]`

## Color Continuous

Helper function for quickly creating a color continuous style.

Data values of each field are interpolated linearly across values in the domain and are then styled with a blend of the corresponding color in the range.

```javascript
new CartoLayer({
  type: MAP_TYPES.QUERY,
  data: 'SELECT the_geom_webmercator, gn_pop FROM populated_places',
  getFillColor: colorContinuous({
    attr: 'gn_pop',
    domain: [0, 1e5],
    colors: 'BluYl'
  })
});
```

### Arguments

#### `attr` (String) {#attr}

Attribute or column to symbolize by.

#### `domain` (Array) {#domain}

Attribute domain to define the data range.

#### `colors` (String | Array, optional) {#colors}

Color assigned to each domain value.

- String: A valid named [CARTOColors](https://carto.com/carto-colors/) palette.
- Array: Array of colors in RGBA `[ [r, g, b, [a]] ]`. 

Default: `PurpOr`

#### `nullColor` (Array, optional) {#nullcolor}

Color for null values.

Default: `[204, 204, 204]`

