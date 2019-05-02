#!/bin/sh
# Example:
# update-release-branch.sh 6.3

set -e

BRANCH=`echo "$1-release"`
VERSION=`echo "$1.0"`
WEBSITE_PAGES=website/contents/pages.js
WEBSITE_WEBPACK_CONFIG=website/webpack.config.js

echo "Updating branch to ${BRANCH}..."

# Replace source links in docs
find docs -iname "*.md" -type f -exec sed -i '' -E "s/deck.gl\/(tree|blob)\/master\/modules/deck.gl\/tree\/${BRANCH}\/modules/g" {} \;
find docs -iname "*.md" -type f -exec sed -i '' -E "s/deck.gl\/(tree|blob)\/master\/examples/deck.gl\/tree\/${BRANCH}\/examples/g" {} \;

# Replace source links in website
sed -i '' -E "s/deck.gl\/master\/docs/deck.gl\/${BRANCH}\/docs/g" "${WEBSITE_PAGES}"
sed -i '' -E "s/deck.gl\/tree\/master\//deck.gl\/tree\/${BRANCH}\//g" "${WEBSITE_PAGES}"

# Replace source links in website/webpack.config.js
sed -i '' -E "s/deck.gl\/master/deck.gl\/${BRANCH}/g" "${WEBSITE_WEBPACK_CONFIG}"

# Bump dependencies in examples
update_dep() {
  FILE=$1
  VERSION=$2
  cat $FILE | jq ".dependencies |= . + \
  with_entries(select(.key | match(\"@?deck.gl\")) | .value |= \"^${VERSION}\")" > temp
  mv temp $FILE
}

# https://stackoverflow.com/questions/4321456/find-exec-a-shell-function-in-linux
export -f update_dep
find examples/*/*/package.json -exec bash -c 'update_dep "$0" $1' {} $VERSION \;
