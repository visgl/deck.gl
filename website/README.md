# Website example catalogs

The website publishes Examples at `/examples` and Arrow Examples at
`/examples-arrow` in the same build.

Edit their pages independently in `src/examples/` and `src/examples-arrow/`.
Their sidebars are `src/examples-sidebar.js` and `src/examples-arrow-sidebar.js`.
Demo implementations live in the repository's corresponding `examples/` and
`examples-arrow/` directories. Shared website components provide layout and controls.

The catalog configuration is in `scripts/example-catalogs.cjs`. Each catalog's
v10 manifest selects the embedded demos built for that catalog.

The homepage, Playground, Pydeck, and scripting gallery use `examples/`.
Run `yarn test-website` from the repository root to validate both catalogs.
