#!/bin/bash

# Ignore pip upgrade warnings
PIP_DISABLE_PIP_VERSION_CHECK=1

USAGE="$(basename "$0") [-h] [--pypi-port=] [--skip-dist-build] \
[--skip-jupyterlab] \
[--skip-jupyter-notebook] \
[--skip-deckgl-build]
  -- run current pydeck branch in JupyterLab and Jupyter Notebook

where:
    -h                       show this text
    --pypi-port              port on which to run local Python package index (default: 8080)
    --skip-jupyterlab        skip JupyterLab build (default: false)
    --skip-jupyter-notebook  skip Jupyter Notebook build (default: false)
    --skip-deckgl-build      cancels \`yarn bootstrap\`, not rebuilding deck.gl (default: false)
    --skip-dist-build        skip building a new distribution version of pydeck (default: false)"

YELLOW='\033[1;33m'
RED='\033[1;31m'
NC='\033[0m' # No Color

function cleanup {
  if [ -n "$PYPISERVER_PID" ]; then
    kill $PYPISERVER_PID
  fi
  jupyter notebook stop 8888
  jupyter notebook stop 8889
}
trap cleanup EXIT


function ctrlc {
  cleanup
  exit 0
}

trap ctrlc SIGINT

for ARGUMENT in "$@"
do

  KEY=$(echo $ARGUMENT | cut -f1 -d=)
  VALUE=$(echo $ARGUMENT | cut -f2 -d=)   

  case "$KEY" in
    -h)                       echo "$USAGE" && exit ;;
    --pypi-port)               PYPI_PORT=${VALUE} ;;
    --skip-dist-build)         SKIP_DIST_BUILD=true ;;     
    --skip-jupyterlab)         SKIP_JUPYTERLAB=true ;;     
    --skip-deckgl-build)       SKIP_DECKGL_BUILD=true ;;     
    --skip-jupyter-notebook)   SKIP_JUPYTER_NOTEBOOK=true ;;     
    *)                        echo "invalid argument $KEY" && echo "$USAGE" && exit ;;
  esac    
done

PYPI_PORT=${PYPI_PORT:-8080}
SKIP_DIST_BUILD=${SKIP_DIST_BUILD:-false}
SKIP_DECKGL_BUILD=${SKIP_DECKGL_BUILD:-false}
SKIP_JUPYTERLAB=${SKIP_JUPYTERLAB:-false}
SKIP_JUPYTER_NOTEBOOK=${SKIP_JUPYTER_NOTEBOOK:-false}

function log_info {
  printf "[`date`]$YELLOW- build-and-screenshot.sh - $1$NC\n"
}

function log_error {
  printf "[`date`] $RED$1$NC\n"
}


if [[ -z `pip list | grep pypiserver` ]]; then
  log_info "Installing pypiserver..."
  pip install pypiserver
fi

function check_port {
  nc -z -v -G5 localhost $PYPI_PORT &> /dev/null
  result=$?
  if [ "$result" == 0 ]; then
    log_error "Port $PYPI_PORT occupied. Specify another or free this one."
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
  ./env/bin/python -m pip install .
  ./env/bin/python setup.py sdist bdist_wheel --is-integration-build &> /dev/null
  export PYDECK_VERSION=`./env/bin/python -c "import pydeck; print(pydeck.__version__)"`
  export DECKGL_VERSION=`./env/bin/python -c "import pydeck; print(pydeck.frontend_semver.DECKGL_SEMVER)"`
  popd
fi

# Starts a local pypi server
pypi-server -p $PYPI_PORT ../../dist/ &
export PYPISERVER_PID=$!

export PYPI_INSTALL_URL=http://localhost:$PYPI_PORT
export LOCAL_NPM_REGISTRY=filesystem

log_info "Installing pydeck==$PYDECK_VERSION with @deck.gl/jupyter-widget@$DECKGL_VERSION"
log_info "from $PYPI_INSTALL_URL and $LOCAL_NPM_REGISTRY respectively"


function jupyterlab_setup {
  pip install jupyterlab
  pip install ipywidgets
  pip install numpy
  jupyter serverextension enable --py jupyterlab --sys-prefix
  pip install -i $PYPI_INSTALL_URL https://pypi.org/simple pydeck==$PYDECK_VERSION
  jupyter labextension install @jupyter-widgets/jupyterlab-manager
  # TODO This command takes a very long time for some reason, would be great to understand why
  jupyter labextension install ../../../../modules/jupyter-widget
  jupyter lab --no-browser --port 8888 &
}

function jupyter_notebook_setup {
  pip install jupyter
  pip install ipywidgets
  pip install -i $PYPI_INSTALL_URL --extra-index-url https://pypi.org/simple pydeck==$PYDECK_VERSION
  jupyter nbextension install --sys-prefix --symlink --overwrite --py pydeck
  jupyter nbextension enable --sys-prefix --py pydeck
  jupyter notebook --no-browser --port 8889 &
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

function build_jupyterlab {
  if $SKIP_JUPYTERLAB; then
    log_info "Skipping JupyterLab build"
  else
    log_info "Running JupyterLab build"
    log_info "Please note: This currently takes 1-2 minutes"
    jupyterlab_setup
  fi
}

function build_jupyter_notebook {
  if $SKIP_JUPYTER_NOTEBOOK; then
    log_info "Skipping Jupyter Notebook build"
  else
    log_info "Running Jupyter Notebook build"
    jupyter_notebook_setup
  fi
}

fresh_env
activate
build_jupyterlab
build_jupyter_notebook


log_info "JupyterLab will be running at http://localhost:8888"
log_info "Jupyter Notebook will be running at http://localhost:8889"
log_info "Ctrl+C to Exit"
read -r -d '' _ </dev/tty
