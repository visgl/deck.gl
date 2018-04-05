#!/bin/sh
# Script to bootstrap repo for development

set -e

# install dependencies
yarn

ROOT_MODULES=`pwd`/node_modules

cd modules
for D in *; do (
  [ -d $D ]
  cd $D

  # create symlink to dev dependenciess at root
  # this is a bug of yarn: https://github.com/yarnpkg/yarn/issues/4964
  # TODO - remove when fixed
  mkdir -p node_modules
  ln -sf $ROOT_MODULES/.bin ./node_modules
); done

# build the module
npm run build