# Contributing to deck.gl

**Thanks for taking the time to contribute!**

PRs and bug reports are welcome, and we are actively looking for new maintainers.


## Setting Up Dev Environment

The **master** branch is the active development branch.

Building deck.gl locally from the source requires node.js `>=14`. Further limitations on the Node version may be imposed by [puppeteer](https://github.com/puppeteer/puppeteer#usage) and [headless-gl](https://github.com/stackgl/headless-gl#supported-platforms-and-nodejs-versions).
We use [yarn](https://yarnpkg.com/en/docs/install) to manage the dependencies of deck.gl.

```bash
git checkout master
yarn bootstrap
yarn test
```

See [additional instructions](#troubleshooting) for Windows, Linux and Apple M1.

Run the layer browser application:

```bash
cd examples/layer-browser
yarn
yarn start-local
```

If you consider opening a PR, here is some documentation to get you started:

- vis.gl [developer process](https://www.github.com/visgl/tsc/tree/master/developer-process)
- [deck.gl API design guidelines](https://github.com/visgl/deck.gl/tree/master/dev-docs/deckgl-api-guidelines.md)

## Testing examples with modified deck.gl source

Each example can be run so that it is built against the deck.gl source code in this repo instead of building against the installed version of deck.gl. This enables using the examples to debug the main deck.gl library source.

To do so use the `yarn start-local` command present in each example's directory. See [webpack.config.local.js](https://github.com/visgl/deck.gl/blob/master/examples/webpack.config.local.js) for details.

### Working with other vis.gl dependencies

Deck.gl has a number of dependencies that fall under vis.gl, and there may be times when it is necessary to make a change in one of these.
Thus for development it is necessary to checkout a copy of such a dependency and make local changes.

When running an example using `yarn start-local` you can use local version of [luma.gl](https://github.com/visgl/luma.gl/) or [math.gl](https://github.com/uber-web/math.gl) by appending the `--env.local-luma` or `--env.local-math` option.

It is possible to test against the local source of other dependency libraries by modifying [examples/vite.config.local.mjs](https://github.com/visgl/deck.gl/blob/master/examples/vite.config.local.mjs).


## Community Governance

vis.gl is part of the [OpenJS Foundation](https://openjsf.org/). See the organization's [Technical Charter](https://github.com/visgl/tsc/blob/master/Technical%20Charter.md).


### Technical Steering Committee

deck.gl development is governed by the vis.gl Technical Steering Committee (TSC). Current members:

- [Ib Green](https://github.com/ibgreen)
- [Xiaoji Chen](https://github.com/Pessimistress) - chairperson
- [Alberto Asuero](https://github.com/alasarr)


### Maintainers

- [Andrew Duberstein](https://github.com/ajduberstein) - pydeck, json
- [Xintong Xia](https://github.com/xintongxia) - layers
- [Georgios Karnas](https://github.com/georgios-uber) - glTF
- [Kyle Barron](https://github.com/kylebarron) - tiles
- [Chris Gervang](https://github.com/chrisgervang) - terrain
- [Dario D'Amico](https://github.com/damix911) - ArcGIS
- [Javier Aragón](https://github.com/padawannn) - MVT, CARTO
- [Víctor Velarde](https://github.com/VictorVelarde) - MVT, CARTO
- [Felix Palmer](https://github.com/felixpalmer) - MVT, GoogleMaps, CARTO
- [Ilan Gold](https://github.com/ilan-gold) - tiles

Maintainers of deck.gl have commit access to this GitHub repository, and take part in the decision making process.

If you are interested in becoming a maintainer, read the [governance guidelines](https://github.com/visgl/tsc/blob/master/governance.md).

The vis.gl TSC meets monthly and publishes meeting notes via a [mailing list](https://lists.uc.foundation/g/visgl).
This mailing list can also be utilized to reach out to the TSC.


## Code of Conduct

Please be mindful of and adhere to the Linux Foundation's [Code of Conduct](https://lfprojects.org/policies/code-of-conduct/) when contributing to deck.gl.

## Troubleshooting

### Develop on Linux

To run the test suite, you may need to install additional dependencies (verified on Ubuntu LTS):

- [headless-gl dependencies](https://github.com/stackgl/headless-gl#system-dependencies) for the Node tests
- [puppeteer dependencies](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix) for the integration tests

Verify that everything works by running `yarn test`.

### Develop on Windows

It's possible to set up the dev environment in [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10).

To run the Node tests, you need to set up OpenGL support via X11 forwarding:

- Install [VcXsrv](https://sourceforge.net/projects/vcxsrv/).
- Run `xlaunch.exe`, choose multiple windows, display 0, start no client, disable native opengl, disable access control. [reference](https://github.com/Microsoft/WSL/issues/2855#issuecomment-358861903)
- If working with WSL2, allow WSL to access your X server with [firewall rules](https://github.com/cascadium/wsl-windows-toolbar-launcher#firewall-rules).
- Set the `DISPLAY` environment variable:

    ```bash
    # WSL 1
    export DISPLAY=localhost:0
    # WSL 2
    export DISPLAY=$(grep -m 1 nameserver /etc/resolv.conf | awk '{print $2}'):0.0
    ```

You can test that it is set up successfully with:

```bash
sudo apt-get install mesa-utils
glxgears
```

You should see a window open with gears turning at this point.

Follow instructions for [developing on linux](#develop-on-linux).

### Develop on MacOs on Apple Silicon (M1 chip)

To install dependencies specify that you explicitly need the arm64 version
```
arch -arm64 brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

You also need a system-wide Python available (`python`). For example, it can be installed using Homebrew and then symlinked:

```
brew install python
sudo ln -s /opt/homebrew/bin/python3 /opt/homebrew/bin/python
```

After this `yarn bootstrap` can be run with
```
CPLUS_INCLUDE_PATH=/opt/homebrew/include yarn bootstrap
```
