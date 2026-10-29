# Custom projection test app

From the repository root, run `yarn`, then:

```sh
cd test/apps/custom-projection
yarn start-local
```

The view resolves its target CRS through `@math.gl/projection`. Layer input,
camera centers, picking coordinates and controller bounds use WGS84 longitude/latitude.
`resolution` specifies subdivision in degrees. Common space uses a fixed scale of
`512 / 40075016.6855` per target meter, adjusted for each target axis's linear units.

The projection selector offers Web Mercator, Equal Earth, equirectangular and
north-polar stereographic. CRS descriptors supply conversion, normalization,
bounds and ground distance scales. Finite bounds define local scale sampling.
Stereographic normalization limits the rendering extent to 150 degrees from the
projection center, corresponding to 60°S for this North Pole view. Conversion
functions remain usable outside that rendering extent.

Navigation uses map-style pitch and bearing on the common-space ground plane.
Selecting a projection restores its initial framing; stereographic centers on
the North Pole. The Reset view widget restores that framing after navigation.

The app and projection helpers are TypeScript. After building the local core/layers/widgets
packages, typecheck the demo from the repository root with:

```sh
yarn tsc -p test/apps/custom-projection/tsconfig.json
```
