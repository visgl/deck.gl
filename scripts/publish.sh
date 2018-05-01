#!/bin/sh
# Script to publish modules

set -e

# beta or prod
MODE=$1

# Check permission
ACCOUNT=`npm whoami`

if [[ $ACCOUNT != 'deck.gl' ]]; then
  echo "Must sign in to deck.gl account to publish"
  exit 1
fi

case $MODE in
  "beta")
    # npm-tag argument: npm publish --tag <beta>
    # cd-version argument: increase <prerelease> version
    lerna publish --npm-tag beta --cd-version prerelease
    break;;

  "prod")
    lerna publish --cd-version patch
    break;;

  *) ;;
esac
