# Directory Structure

This file describes the model used for code management.

## Monorepo directory structure

The deck.gl repository is a monorepo, i.e. multiple submodules are published to npm from this repo.

```
deck.gl
  ├── dev-docs              # Documentation for developers of the framework
  ├── docs                  # Documentation for users of the framework
  ├── examples
  │     ├── experimental    # Examples for experimental features
  │     ├── gallery         # Standalone (scripting) examples
  │     ├── get-started     # Boilerplate templates
  │     ├── layer-browser   # Layer browser app, for dev testing
  │     └── website         # Examples used on the website
  ├── modules
  │     └── <submodule>     # @deck.gl/<submodule> source
  │           ├── src
  │           ├── README.md
  │           └── package.json
  ├── scripts               # Dev scripts for lint, test, build etc.
  ├── showcases             # Advanced expamples (less maintenance and support)
  ├── test
  │     ├── apps            # Apps for dev testing, e.g. WIP features
  │     ├── bench           # Benchmarks
  │     ├── data            # Constants used by test cases
  │     ├── modules         # Unit tests, mirrors `modules` structure
  │     │     └── <submodule>
  │     └── render          # Render tests
  └── website               # The deck.gl website
```


## Branching and Releasing Model

The `master` branch of the repo is the latest dev branch. It is used to publish the latest **beta** releases, e.g. `7.0.0-alpha.1`.

Each minor release branches off from master, e.g. `6.0-release`, `6.1-release`. **Important**: All production releases are built and published from respective release branches.

The [Website](https://deck.gl) is built from the `<latest>-release` branch.

[Documentation](https://deck.gl/#/Documentation) is served directly from the `<latest>-release` branch.

Only the `master` branch and the `<latest>-release` branch are actively maintained.

