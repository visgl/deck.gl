#!/bin/bash
export PYDECK_VERSION=0.2.1
export PYPI_INSTALL_URL=https://test.pypi.org/simple/
docker-compose build --parallel && docker-compose up --no-build -d
python snap.py
docker-compose down
