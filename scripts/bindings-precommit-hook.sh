#!/bin/bash
IS_PYTHON=$(git diff --cached --name-only | grep "pydeck")

if [[ -n "$IS_PYTHON" ]]; then
  echo "Running pre-commit hook for pydeck"
  (cd bindings/pydeck && make pre-commit)
fi
RESULT=$?
[ $RESULT -ne 0 ] && exit 1

exit 0
