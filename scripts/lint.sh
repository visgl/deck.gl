#!/bin/sh
# Script to check code styles
set -e

MODE=$1

case $MODE in
  "pre-commit")
    echo "Running prettier & eslint..."

    # only check changed files
    set +e
    FILES=`git diff HEAD --name-only | grep -E "^(modules|examples|test).*\.js$"`
    set -e

    if [ ! -z "${FILES}" ]; then
      for f in $FILES
        do
          if [ -e "${f}" ]; then
            prettier --write $f --loglevel warn
            eslint $f
          fi
      done
    fi

    # add changes to commit
    git add .
    break;;

  *)
    echo "Checking prettier code styles..."
    prettier-check "{modules,examples,test}/**/*.js" || echo "Running prettier." && prettier --write "{modules,examples,test}/**/*.js" --loglevel warn

    echo "Running eslint..."
    eslint modules test examples
    ;;
  esac

# check if yarn.lock contains private registery information
!(grep -q unpm.u yarn.lock) && echo 'Lockfile valid.' || (echo 'Please rebuild yarn file using public npmrc' && false)
