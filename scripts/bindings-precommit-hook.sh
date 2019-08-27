#!/bin/bash
IS_PYTHON=$(git diff --cached --name-only | grep "bindings/python/")
HAS_PYTEST=$(command -v pytest)

if [[ -n "$IS_PYTHON" ]]; then
  echo "Running Python pre-commit hook"

  if [[ -z "$HAS_PYTEST" ]]; then
    echo "pytest is not installed. See the pydeck README."
    exit 1
  fi

  pytest bindings/python/pydeck/tests/
fi
RESULT=$?
[ $RESULT -ne 0 ] && exit 1

exit 0
