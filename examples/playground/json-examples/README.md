# JSON examples

JSON versions of deck.gl examples go into this folder.

- New examples need to be listed in `../json-examples/index.js`
- Any new layers or classes used by the examples need to be added to `../'src/configuration.js`
- Declarative view layout examples can use the playground-local `viewLayout` prop. Layout
  nodes use `layout` as the discriminator, while deck.gl view leaves still use `@@type`.
