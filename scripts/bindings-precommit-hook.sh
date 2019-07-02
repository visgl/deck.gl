#!/bin/bash
IS_PYTHON=$(git diff --cached --name-only | grep "bindings/python/")

if [[ -n "$IS_PYTHON" ]]; then
  echo "Running Python pre-commit hook"
  pytest bindings/python/pydeck/tests/
fi
RESULT=$?
[ $RESULT -ne 0 ] && exit 1

exit 0
