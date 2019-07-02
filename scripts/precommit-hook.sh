#!/bin/bash
IS_PYTHON=$(git diff --cached --name-only | grep "bindings/python/")
IS_JS=$(git diff --cached --name-only | grep -v "bindings/python/")

if [[ -n "$IS_PYTHON" ]]; then
  echo "Running Python pre-commit hook"
  pytest bindings/python/pydeck/tests/
fi
RESULT=$?
[ $RESULT -ne 0 ] && exit 1

if [[ -n "$IS_JS" ]]; then
  echo "Running JS pre-commit hook"
  ./node_modules/pre-commit/hook
fi
RESULT=$?
[ $RESULT -ne 0 ] && exit 1

exit 0
