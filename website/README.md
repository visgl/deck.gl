# Website example sources

The website uses the repository's `examples-arrow/` directory by default.
Set `WEBSITE_EXAMPLES_DIR=examples` to use the original `examples/`
directory.

Run the website check with the original examples from the repository root.

```sh
WEBSITE_EXAMPLES_DIR=examples yarn test-website
```

The same setting works with `yarn start`, `yarn build`, and
`yarn build-staging` from the `website/` directory.
