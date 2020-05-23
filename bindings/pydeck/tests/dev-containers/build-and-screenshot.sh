#!/bin/bash

USAGE="$(basename "$0") [-h] [-port=] [-skip-dist-build=] -- run current pydeck branch in JupyterLab and Jupyter Notebook

where:
    -h                show this text
    -port             port on which to run local Python package index (default: 8080)
    -skip-dist-build  skip building a new distribution version of pydeck (default: false)"

YELLOW='\033[0;33m'
NC='\033[0m' # No Color

for ARGUMENT in "$@"
do

  KEY=$(echo $ARGUMENT | cut -f1 -d=)
  VALUE=$(echo $ARGUMENT | cut -f2 -d=)   

  case "$KEY" in
    -h)                 echo "$USAGE" && exit ;;
    -port)              PORT=${VALUE:-8080} ;;
    -skip-dist-build)   SKIP_DIST_BUILD=${VALUE:-0} ;;     
    *)                 echo "invalid argument $KEY" && echo "$USAGE" && exit ;;
  esac    
done


if [[ -z `pip list | grep pypiserver` ]]; then
  printf "$YELLOW  Installing pypiserver... $NC\n"
  pip install pypiserver
fi

# Check if port taken
# nc -z -v -G5 localhost $PORT &> /dev/null
# result=$?
# if [ "$result" == 0 ]; then
#   echo "Port $PORT occupied. Please use a different port or free this one."
#   exit 1
# fi
# 
# 
if [ "$SKIP_DIST_BUILD" ]; then
  printf "$YELLOW  Skipping dist build, serving builds that are present $NC\n"
else
  printf "$YELLOW  Building pydeck distribution from current branch $NC\n"
  python ../../setup.py sdist bdist_wheel
fi

# Starts a local pypi server
pypiserver -p $PORT ../../dist/ &
PYPISERVER_PID=$!

function cleanup {
  kill $PYPISERVER_PID
}
trap cleanup EXIT

# # All of these variables are used within the Docker builds
# export PYDECK_VERSION=`python -c "import pydeck; print(pydeck.__version__)"`
# export DECKGL_VERSION=`python -c "import pydeck; print(pydeck.frontend_semver.DECKGL_SEMVER)"`
# export PYPI_INSTALL_URL=http://localhost:$PORT
# 
# docker-compose build --force-rm --no-cache --parallel && docker-compose up --no-build -d
# python snap.py
# docker-compose down
