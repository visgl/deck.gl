# Change Log

All notable changes to deck.gl will be documented in this file.

For a human readable version, visit https://deck.gl/#/documentation/overview/upgrade-guide

<!--
Each version should:
  List its release date in the above format.
  Group changes to describe their impact on the project, as follows:
  Added for new features.
  Changed for changes in existing functionality.
  Deprecated for once-stable features removed in upcoming releases.
  Removed for deprecated features removed in this release.
  Fixed for any bug fixes.
  Security to invite users to upgrade in case of vulnerabilities.
Ref: http://keepachangelog.com/en/0.3.0/
-->

## deck.gl v8.6

#### deck.gl [8.6.1] - Nov 2 2021

- Skip rendering out-of-DOM Google Maps (#6340)

#### deck.gl [8.6.0] - Oct 11 2021

- Google Maps Overlay: Safely invoke onRender by resetting arrayBuffer (#6224)
- Bump luma to 8.5.10 (#6267)
- Update HexagonLayer to use the new unit system (#6260)
- Use accurate meter size in Web Mercator projection (#6117)
- Improve picking index encoding (#6184)
- H3HexagonLayer: force low precision; early exit for data analysis loop (#6242)
- TileLayer retains cache on data change (#6194)
- Check visible recursively (#6190)
- Use layerFilter in MapboxLayer (#6189)
- Google overlay state synchronization (#6177)
- Add geoColumn & columns props to CartoLayer (#6097)
- Bug fixes in google overlay (#6083)
- OrthographicView supports independent x/y zoom levels (#6116)
- Only call layerFilter with top-level layers (#6049)
- Support vector maps in google module (#5981)


### deck.gl v8.6 Prereleases

#### deck.gl [8.6.0-beta.1] - Oct 9 2021

- Default to binary mode in MVTLayer (#6282)

#### deck.gl [8.6.0-alpha.4] - Oct 6 2021

- Google Maps Overlay: Safely invoke onRender by resetting arrayBuffer (#6224)
- Bump luma to 8.5.10 (#6267)
- Update HexagonLayer to use the new unit system (#6260)
- Use accurate meter size in Web Mercator projection (#6117)
- Improve picking index encoding (#6184)
- H3HexagonLayer: force low precision; early exit for data analysis loop (#6242)
- TileLayer retains cache on data change (#6194)
- Fix excessive allocation for constant attributes (#6233)
- Fix Heatmap data update (#6231)
- Fix diffProps when an async prop is set synchronously (#6193)
- Fix TileLayer getTileData not using the latest loadOptions (#6209)
- Fix missing picking radius for onClick handlers (#6208)
- Check visible recursively (#6190)
- TileLayer uses props.extent to cull tiles in geospatial mode (#6191)
- Use layerFilter in MapboxLayer (#6189)

#### deck.gl [8.6.0-alpha.3] - Sep 9 2021

- Improve shader projection in auto offset mode (#6161)
- Google overlay state synchronization (#6177)

#### deck.gl [8.6.0-alpha.2] - Sep 6 2021

- Drop sublayers with no data even if the _subLayerProps prop contains (#6160)
- Heatmap - expose additional properties (#6158)
- pydeck: Enable custom_map_style and file encoding for HTML on Windows (#6121)
- Additional reference points for bounding volume calculation - globe view (#6148)
- CARTO: include API error at the exception message (#6143)
- Bump luma.gl to 8.5.5 (#6132)
- Fix Default Values in `AttributeManager` `add` method (#6130)
- Fix TileLayer and Tile3DLayer visiblility (#6123)
- Add geoColumn & columns props to CartoLayer (#6097)
- Bug fixes in google overlay (#6083)
- OrthographicView supports independent x/y zoom levels (#6116)
- Only call layerFilter with top-level layers (#6049)
- Add zero _offset to Tile3DLayer (#6108)
- Fix MVTLayer autoHighlight with binary data (#6098)
- Improve tile traversal in GlobeView (#6106)
- Bump loaders to 3.0.8 (#6075)
- Scatterplot layer: smooth edges prop (#6081)

#### deck.gl [8.6.0-alpha.1] - Aug 9 2021

- Support vector maps in google module (#5981)
- Check for correct layerName when highlighting in MVTLayer (#6062)
