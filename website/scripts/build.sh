node scripts/validate-token.js

# staging or prod
MODE=$1
WEBSITE_DIR=`pwd`

# clean up dist directory
rm -rf ./dist
mkdir dist

# copy static assets
cp -r ./src/static/* dist

case $MODE in
  "prod")
    mv dist/index-prod.html dist/index.html
    ;;
  "staging")
    mv dist/index-staging.html dist/index.html
    # build production bundles
    cd ../modules/core
    yarn build-bundle
    cp debug.min.js $WEBSITE_DIR/dist
    cd ../main
    yarn build-bundle
    cp dist.min.js $WEBSITE_DIR/dist
    cd $WEBSITE_DIR
    ;;
esac

# transpile workers
BABEL_ENV=es5 babel --config-file ../babel.config.js ./src/static/workers --out-dir dist/workers

# build script
webpack -p --env.prod

# build gallery (scripting) examples
(
  cd ../examples/gallery
  yarn
  yarn build
)
mkdir dist/gallery
cp -r ../examples/gallery/dist/* dist/gallery/

# build playground (json) examples
(
  cd ../examples/playground
  yarn
  yarn build
)
mkdir dist/playground
cp -r ../examples/playground/dist/* dist/playground/
