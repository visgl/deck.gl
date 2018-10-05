#!/bin/sh
# Script to publish modules

set -e

# beta or prod
MODE=$1

case $MODE in
  "beta")
    # npm-tag argument: npm publish --tag <beta>
    # cd-version argument: increase <prerelease> version
    lerna publish --npm-tag beta --cd-version prerelease
    break;;

  "prod")
    lerna publish --cd-version minor
    break;;

  *) ;;
esac
