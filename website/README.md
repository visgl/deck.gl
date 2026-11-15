# Website example catalogs

The website publishes Examples at `/examples` and v10 Examples at
`/examples-v10` in the same build.

Edit their pages independently in `src/examples/` and `src/examples-v10/`.
Their sidebars are `src/examples-sidebar.js` and `src/examples-v10-sidebar.js`.
Demo implementations live in the repository's corresponding `examples/` and
`examples-v10/` directories. Shared website components provide layout and controls.

The catalog configuration is in `scripts/example-catalogs.cjs`. The v10 catalog's manifest
selects embedded demos from `examples-v10/proposals/`.

The homepage, Playground, Pydeck, and scripting gallery use `examples/`.
Run `yarn test-website` from the repository root to validate both catalogs.
