# Styles

Helper functions to create data-driven map visualizations.

Take the advantage of [CARTOColors](https://carto.com/carto-colors/), custom color schemes built on top of well-known standards for color use on maps, with next generation enhancements for the web and CARTO basemaps.

## colorBins

Helper function for quickly creating a color bins style.

Data values of each attribute are rounded down to the nearest value in the domain and are then styled with the corresponding color.

```javascript
new CartoSQLLayer({
  data: 'SELECT the_geom_webmercator, gn_pop FROM populated_places',
  getFillColor:  colorBins({
    attr: 'gn_pop',
    domain: [1e5, 2e5, 3e5],
    colors: 'Teal'
  })
});
```

### Arguments

#### `attr` (String) 

Attribute or column to symbolize by.

#### `domain` (Array) 

Assign manual class break values.

#### `colors` (String | Array, optional)

Color assigned to each domain value.

- String: A valid named [CARTOColors](https://carto.com/carto-colors/) palette.
- Array: Array of colors in RGBA `[ [r, g, b, [a]] ]`. 

Default: `PurpOr`

#### `nullColor` (Array, optional)

Color for null values.

Default: `[204, 204, 204]`

## colorCategories

Helper function for quickly creating a color category style.

Data values of each attribute listed in the domain are mapped one to one with corresponding colors in the range.

```javascript
new CartoSQLLayer({
  data: 'SELECT the_geom_webmercator, type FROM ne_10m_airports',
  getFillColor: colorCategories({
    attr: 'type',
    categories: ['mid', 'major', 'military mid', 'mid and military', 'major and military'],
    colors: 'Bold'
  })
});
```

### Arguments

#### `attr` (String) 

Attribute or column to symbolize by.

#### `domain` (Array) 

Category list. Must be a valid list of categories.

#### `colors` (String | Array, optional)

Color assigned to each domain value.

- String: A valid named [CARTOColors](https://carto.com/carto-colors/) palette.
- Array: Array of colors in RGBA `[ [r, g, b, [a]] ]`. 

Default: `PurpOr`

#### `nullColor` (Array, optional)

Color for null values.

Default: `[204, 204, 204]`

#### `othersColor` (Array, optional) for `colorCategories`

Fallback color for a category not correctly assigned.

Default: `[119, 119, 119]`

## Color Continuous

Helper function for quickly creating a color continuous style.

Data values of each field are interpolated linearly across values in the domain and are then styled with a blend of the corresponding color in the range.

```javascript
new CartoSQLLayer({
  data: 'SELECT the_geom_webmercator, gn_pop FROM populated_places',
  getFillColor: colorContinuous({
    attr: 'gn_pop',
    domain: [0, 1e5],
    colors: 'BluYl'
  })
});
```

### Arguments

#### `attr` (String) 

Attribute or column to symbolize by.

#### `domain` (Array) 

Attribute domain to define the data range.

#### `colors` (String | Array, optional)

Color assigned to each domain value.

- String: A valid named [CARTOColors](https://carto.com/carto-colors/) palette.
- Array: Array of colors in RGBA `[ [r, g, b, [a]] ]`. 

Default: `PurpOr`

#### `nullColor` (Array, optional)

Color for null values.

Default: `[204, 204, 204]`

