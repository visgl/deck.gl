#!/bin/bash

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
DEV_TOOLS_DIR="$ROOT_DIR/node_modules/@vis.gl/dev-tools/dist"
TS_PROJECT=$(node "$DEV_TOOLS_DIR/helpers/get-config.js" ".typescript.project")
TSPC="$ROOT_DIR/node_modules/.bin/tspc"

MODULES=""

while [ "${1-}" != "" ]; do
  if [[ "$1" =~ ^\-\-[A-Za-z]+ ]]; then
    echo -e "\033[91mUnknown option $1. build-modules.sh [module1,module2,...]\033[0m"
    exit 1
  fi

  MODULES=$(echo "$1" | sed -e 's/,/ modules\//g' | sed -e 's/^/modules\//g')
  shift
done

if [ -z "$MODULES" ]; then
  MODULES=$(node "$DEV_TOOLS_DIR/helpers/build-order.js")
fi

for D in ${MODULES}; do (
  if [ -e "$ROOT_DIR/$D/package.json" ]; then
    echo -e "\033[1mBuilding $D\033[0m"
    cd "$ROOT_DIR/$D"

    # tspc may no-op if stale incremental metadata remains after dist was removed.
    rm -f tsconfig.tsbuildinfo
    "$TSPC" --declaration --declarationMap --sourceMap --outDir dist --project "$TS_PROJECT"

    if [ ! -f "./dist/index.js" ]; then
      echo -e "\033[91mExpected $D/dist/index.js after tspc, but it was not emitted.\033[0m"
      exit 1
    fi

    node "$DEV_TOOLS_DIR/build-cjs.js"
    echo ""
  elif [ ! -e "$ROOT_DIR/$D" ]; then
    echo -e "\033[1mWarning: skipping $D because it doesn't match any file.\033[0m"
    echo -e "\033[1mHint: modules must be specified using full path relative to the project root.\033[0m"
    echo ""
  fi
); done
