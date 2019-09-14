node scripts/validate-token.js

# clean up dist directory
rm -rf ./dist
mkdir dist

# copy static assets
cp -r ./src/static/* dist

# transpile workers
BABEL_ENV=es5 babel --config-file ../babel.config.js ./src/static/workers --out-dir dist/workers

# build script
webpack -p --env.prod

# build gallery (scripting) examples
(
  cd ../examples/gallery
  yarn build
)
mkdir dist/gallery
cp -r ../examples/gallery/dist/* dist/gallery/

# build playground (json) examples
(
  cd ../examples/playground
  yarn build
)
mkdir dist/playground
cp -r ../examples/playground/dist/* dist/playground/
