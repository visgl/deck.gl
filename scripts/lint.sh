#!/bin/sh
# Script to check code styles

set -e

prettier-check "{modules,examples,test}/**/*.js" || echo "Running prettier." && prettier --write "{modules,examples,test}/**/*.js" --loglevel warn

eslint modules test examples

# check if yarn.lock contains private registery information
!(grep -q unpm.u yarn.lock) && echo 'Lockfile valid.' || (echo 'Please rebuild yarn file using public npmrc' && false)
