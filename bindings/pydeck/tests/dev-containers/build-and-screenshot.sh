#!/bin/bash
export PYDECK_VERSION="0.4.0"
export PYPI_INSTALL_URL=https://test.pypi.org/simple/
docker-compose build --force-rm --no-cache --parallel && docker-compose up --no-build -d
python snap.py
docker-compose down
