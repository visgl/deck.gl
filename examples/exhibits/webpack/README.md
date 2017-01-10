<div align="center">
  <img src="https://cdn.pbrd.co/images/55RnpX6a3.png" />
</div>

## Exhibits: Webpack

The configuration showcased here is a bit less straightforward than its browserify equivalent
due to some incompatibilities with mapbox-gl, but has been kept at a strict minimum.

You should keep in mind that it is a development configuration, and probably should be tweaked
a bit for production optimization, there is plenty ressources on the subject and are not in
the scope of this example.

The `resolve`, `postLoaders` and `node` properties and having the `json-loader` are the only required parts for `deck.gl`
to work and have to be kept.
