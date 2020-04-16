## Contributing to deck.gl

**Thanks for taking the time to contribute!**

PRs and bug reports are welcome, and we are actively looking for new maintainers.


## Setting Up Dev Environment

The **master** branch is the active development branch.

Building deck.gl locally from the source requires node.js `10.x-12.12`.
We use [yarn](https://yarnpkg.com/en/docs/install) to manage the dependencies of deck.gl.

```bash
git checkout master
yarn bootstrap
yarn test
```

Run the layer browser application:

```bash
cd examples/layer-browser
yarn
yarn start-local
```

If you consider opening a PR, here are some documentations to get you started:

- vis.gl [developer process](https://www.github.com/visgl/tsc/tree/master/developer-process)
- [deck.gl API design guidelines](/dev-docs/deckgl-api-guidelines.md)


## Community Governance

vis.gl is part of the [Urban Computing Foundation](https://uc.foundation/). See the organization's [Technical Charter](https://github.com/visgl/tsc/blob/master/Technical%20Charter.md).


### Technical Steering Committee

deck.gl development is governed by the vis.gl Technical Steering Committee (TSC). Current members:

- [Ib Green](https://github.com/ibgreen)
- [Xiaoji Chen](https://github.com/Pessimistress) - chairman
- [Tarek Sherif](https://github.com/tsherif)
- [Ravi Akkenapally](https://github.com/1chandu)


### Maintainers

- [Andrew Duberstein](https://github.com/ajduberstein) - pydeck, json
- [Xintong Xia](https://github.com/xintongxia) - layers
- [Georgios Karnas](https://github.com/georgios-uber) - glTF
- [Dario D'Amico](https://github.com/damix911) - ArcGIS
- [Jesús Botella](https://github.com/jesusbotella) - MVT

Maintainers of deck.gl have commit access to this GitHub repository, and take part in the decision making process.

If you are interested in becoming a maintainer, read the [governance guidelines](https://github.com/visgl/tsc/tree/master/developer-process/governance.md).

The vis.gl TSC meets monthly and publishes meeting notes via a [mailing list]().
This mailing list can also be utilized to reach out to the TSC.  


## Code of Conduct

Please be mindful of and adhere to the Linux Foundation's [Code of Conduct](https://lfprojects.org/policies/code-of-conduct/) when contributing to deck.gl.