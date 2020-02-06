# Sample using @arcgis/webpack-plugin

## Usage

```
npm install

# run local dev server
npm start

# create a production build
npm run build
```

## TypeScript Typings

You can use the typings included with `arcgis-js-api` two ways.

### Include a `///` directive in your main TypeScript file.
```ts
// main.ts
/// <reference types="arcgis-js-api" />
```

### Or add to the `include` of your `tsconfig.json`.
```json
// tsconfig.json
{
  "compilerOptions": {},
  "include": [
    "node_modules/arcgis-js-api/index.d.ts",
    "src/**/*.ts",
    "src/**/*.tsx"
  ]
}
```