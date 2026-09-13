#!/bin/bash
IS_PYTHON=$(git diff --cached --name-only | grep "pydeck")

if [[ -n "$IS_PYTHON" ]]; then
  if [[ ! -d "bindings/pydeck/.venv" ]]; then
    echo "Skipping pydeck pre-commit: .venv not found (run 'cd bindings/pydeck && make setup-env && make init' to enable)"
    exit 0
  fi
  echo "Running pre-commit hook for pydeck"
  (cd bindings/pydeck && make pre-commit)
fi
RESULT=$?
[ $RESULT -ne 0 ] && exit 1

exit 0
