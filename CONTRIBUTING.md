## Contributing to deck.gl

**Thanks for taking the time to contribute!**

PRs and bug reports are welcome, and we are actively looking for new maintainers.


## Setting Up Dev Environment

The **master** branch is the active development branch.

Building deck.gl locally from the source requires node.js `>=10`. Further limitations on the Node version may be imposed by [puppeteer](https://github.com/puppeteer/puppeteer#usage) and [headless-gl](https://github.com/stackgl/headless-gl#supported-platforms-and-nodejs-versions).
We use [yarn](https://yarnpkg.com/en/docs/install) to manage the dependencies of deck.gl.

```bash
git checkout master
yarn bootstrap
yarn test
```

Additional instructions for [Windows](/CONTRIBUTING.md#develop-on-windows).

Run the layer browser application:

```bash
cd examples/layer-browser
yarn
yarn start-local
```

If you consider opening a PR, here is some documentation to get you started:

- vis.gl [developer process](https://www.github.com/visgl/tsc/tree/master/developer-process)
- [deck.gl API design guidelines](/dev-docs/deckgl-api-guidelines.md)


## Community Governance

vis.gl is part of the [Urban Computing Foundation](https://uc.foundation/). See the organization's [Technical Charter](https://github.com/visgl/tsc/blob/master/Technical%20Charter.md).


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
- [Jesús Botella](https://github.com/jesusbotella) - MVT
- [Javier Aragón](https://github.com/padawannn) - MVT, CARTO
- [Víctor Velarde](https://github.com/https://github.com/VictorVelarde) - MVT, CARTO
- [Raúl Yeguas](https://github.com/neokore) - MVT, CARTO

Maintainers of deck.gl have commit access to this GitHub repository, and take part in the decision making process.

If you are interested in becoming a maintainer, read the [governance guidelines](https://github.com/visgl/tsc/tree/master/developer-process/governance.md).

The vis.gl TSC meets monthly and publishes meeting notes via a [mailing list](https://lists.uc.foundation/g/visgl).
This mailing list can also be utilized to reach out to the TSC.


## Code of Conduct

Please be mindful of and adhere to the Linux Foundation's [Code of Conduct](https://lfprojects.org/policies/code-of-conduct/) when contributing to deck.gl.

## Troubleshooting

### Develop on Windows

It's possible to set up the dev environment in [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10).

To get OpenGL support, install [VcXsrv](https://sourceforge.net/projects/vcxsrv/). In xlaunch.exe, choose multiple windows, display 0, start no client, disable native opengl. ([source](https://github.com/Microsoft/WSL/issues/2855#issuecomment-358861903))

```bash
sudo apt-get update
sudo apt install mesa-utils
export DISPLAY=localhost:0
glxgears
```

If successful, you should see a window open with gears turning.

Next, install [headless-gl dependencies](https://github.com/stackgl/headless-gl#system-dependencies):

```bash
sudo apt-get install -y build-essential libxi-dev libglu1-mesa-dev libglew-dev pkg-config
```

Verify that everything works by running `yarn test node`.
