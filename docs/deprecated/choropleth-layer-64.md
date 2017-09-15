
<p class="badges">
  <img src="https://img.shields.io/badge/-deprecated-red.svg?style=flat-square" alt="64-bit" />
</p>

# Choropleth Layer (64 bit)

Note: The `ChoroplethLayer64` has been deprecated in deck.gl v4 in favor
of the new `GeoJsonLayer` and `PolygonLayer`. It will likely be removed in the
next major release of deck.gl.

The Choropleth Layer takes in [GeoJson](http://geojson.org/) formatted data and
renders it as interactive choropleths.

<div align="center">
  <img height="300" src="/demo/src/static/images/demo-thumb-choropleth.jpg" />
</div>

Check out the [64 bit about page](/docs/64-bits.md) for more info.

    import {ChoroplethLayer64} from 'deck.gl';

Inherits from all [Base Layer](/docs/api-reference/base-layer.md) properties and has
this same as the [Choropleth Layer](/docs/layers/choropleth-layer.md).
