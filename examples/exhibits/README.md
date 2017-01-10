<div align="center">
  <a href="./webpack">
    <img height=85 src="https://cdn.pbrd.co/images/55RnpX6a3.png" style="margin-right:5;" />
  </a>
  <a href="./browserify">
    <img src="https://cdn.pbrd.co/images/vAmSmehU.png" />
  </a>
</div>

## Exhibits

This section contains a very simple and unique usage of deck.gl, being served by
different tools, which do not share the same requirements in term of dependencies
and setup. It can give you a base to work on or a straightforward example to play
with.

#### Requirement

Your only requirement before running either of the examples will be to modify
the [app](./app.js) file to specify your Mapbox token, so
[react-map-gl](https://github.com/uber/react-map-gl) can render the map tiles.

### Commands

Each command will install the dependencies using `yarn` if you have it, or with
`npm` otherwise. `yarn` is faster to install packages, but absolutely not required.

    npm run browserify

Run the example using a [browserify](https://github.com/substack/node-browserify)
process and serve it with [budo](https://github.com/mattdesl/budo).

    npm run webpack

Run the example using [webpack](https://github.com/webpack/webpack).

### Expected result

Although the interface might be slightly different, the result should be exactly the
same, an interactive dark map you can move and tilt with a deck.gl `LineLayer`.

<img src="https://cdn.pbrd.co/images/53pkY8pz1.png" width="300" />
