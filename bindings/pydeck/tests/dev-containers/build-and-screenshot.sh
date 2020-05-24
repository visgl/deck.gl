#!/bin/bash

# Ignore pip upgrade warnings
PIP_DISABLE_PIP_VERSION_CHECK=1

USAGE="$(basename "$0") [-h] [--port=] [--skip-dist-build] \
[--skip-jupyterlab] \
[--skip-jupyter-notebook] \
[--skip-deckgl-build]
  -- run current pydeck branch in JupyterLab and Jupyter Notebook

where:
    -h                       show this text
    --port                   port on which to run local Python package index (default: 8080)
    --skip-jupyterlab        skip JupyterLab build (default: false)
    --skip-jupyter-notebook  skip Jupyter Notebook build (default: false)
    --skip-deckgl-build      cancels \`yarn bootstrap\`, not rebuilding deck.gl (default: false)
    --skip-dist-build        skip building a new distribution version of pydeck (default: false)"

YELLOW='\033[1;33m'
RED='\033[1;31m'
NC='\033[0m' # No Color

for ARGUMENT in "$@"
do

  KEY=$(echo $ARGUMENT | cut -f1 -d=)
  VALUE=$(echo $ARGUMENT | cut -f2 -d=)   

  case "$KEY" in
    -h)                       echo "$USAGE" && exit ;;
    -port)                    PORT=${VALUE} ;;
    -skip-dist-build)         SKIP_DIST_BUILD=true ;;     
    -skip-jupyterlab)         SKIP_JUPYTERLAB=true ;;     
    -skip-deckgl-build)       SKIP_DECKGL_BUILD=true ;;     
    -skip-jupyter-notebook)   SKIP_JUPYTER_NOTEBOOK=true ;;     
    *)                        echo "invalid argument $KEY" && echo "$USAGE" && exit ;;
  esac    
done

PORT=${PORT:-8080}
SKIP_DIST_BUILD=${SKIP_DIST_BUILD:-false}
SKIP_DECKGL_BUILD=${SKIP_DECKGL_BUILD:-false}
SKIP_JUPYTERLAB=${SKIP_JUPYTERLAB:-false}
SKIP_JUPYTER_NOTEBOOK=${SKIP_JUPYTER_NOTEBOOK:-false}

function log_info {
  printf "[`date`] $YELLOW$1$NC\n"
}

function log_error {
  printf "[`date`] $RED$1$NC\n"
}


if [[ -z `pip list | grep pypiserver` ]]; then
  log_info "Installing pypiserver..."
  pip install pypiserver
fi

if [[ -z `npm list -g | grep verdaccio` ]]; then
  log_info "Installing verdaccio..."
  npm install -g verdaccio
fi

function check_port {
  nc -z -v -G5 localhost $PORT &> /dev/null
  result=$?
  if [ "$result" == 0 ]; then
    log_error "Port $PORT occupied. Specify another or free this one."
    exit 1
  fi
}

check_port

if $SKIP_DECKGL_BUILD; then
  log_info "Skipping deck.gl build"
else
  log_info "Building deck.gl from current branch..." && yarn bootstrap
fi

if $SKIP_DIST_BUILD; then
  log_info "Skipping dist build, serving builds that are present"
else
  pushd ../..
  log_info "Building pydeck distribution from current branch..."
  python setup.py sdist bdist_wheel --is-integration-build
  popd
fi

# Starts a local pypi server
pypi-server -p $PORT ./dist/ &
export PYPISERVER_PID=$!

function cleanup {
  if [ -n "$PYPISERVER_PID" ]; then
    kill $PYPISERVER_PID
  fi
  if [ -n "$JL_PID" ]; then
    kill $JL_PID
  fi
  if [ -n "$JN_PID" ]; then
    kill $JN_PID
  fi
}
trap cleanup EXIT

export PYDECK_VERSION=`python -c "import pydeck; print(pydeck.__version__)"`
export DECKGL_VERSION=`python -c "import pydeck; print(pydeck.frontend_semver.DECKGL_SEMVER)"`
export PYPI_INSTALL_URL=http://localhost:$PORT

function jupyterlab_setup {
  pip install jupyterlab
  pip install ipywidgets
  pip install numpy
  jupyter serverextension enable --py jupyterlab --sys-prefix
  pip install -i $PYPI_INSTALL_URL --extra-index-url https://pypi.org/simple pydeck==$PYDECK_VERSION --pre
  jupyter labextension install @jupyter-widgets/jupyterlab-manager
  # TODO This command takes a very long time for some reason, would be great to understand why
  jupyter labextension install @deck.gl/jupyter-widget@$DECKGL_VERSION
  jupyter lab --no-browser &
  PID=$!
  return PID
}

function jupyter_notebook_setup {
  pip install jupyter
  pip install ipywidgets
  pip install -i $PYPI_INSTALL_URL --extra-index-url https://pypi.org/simple pydeck==$PYDECK_VERSION --pre
  jupyter nbextension install --sys-prefix --symlink --overwrite --py pydeck
  jupyter nbextension enable --sys-prefix --py pydeck
  jupyter notebook --no-browser &
  PID=$!
  return PID
}

function activate {
  # Use a particular Python environment
  # We'll exit this env after the shell exits this script
  source ./env/bin/activate
  log_info "Using python at `which python`"
}

function fresh_env {
  # Create a new virtualenv
  log_info "Creating new virtual environment"
  rm -rf ./env
  python3 -m venv env
}

fresh_env
activate

if $SKIP_JUPYTERLAB; then
  log_info "Skipping JupyterLab build"
else
  log_info "Running JupyterLab build"
  log_info "Please note: This currently takes 1-2 minutes"
  export JL_PID=`jupyterlab_setup`
fi

if $SKIP_JUPYTER_NOTEBOOK; then
  log_info "Skipping Jupyter Notebook build"
else
  log_info "Running Jupyter Notebook build"
  export JN_PID=`jupyter_notebook_setup`
fi

function ctrlc {
  cleanup
  exit 0
}

trap ctrlc SIGINT

log_info "JupyterLab will be running at http://locahost:8888"
log_info "Jupyter Notebook will be running at http://locahost:8889"
log_info "Ctrl+C to Exit"
read -r -d '' _ </dev/tty
