#!/bin/bash

USAGE="$(basename "$0") [-h] [-port=] [-skip-dist-build] [-skip-jupyterlab] [-skip-jupyter-notebook] -- run current pydeck branch in JupyterLab and Jupyter Notebook

where:
    -h                      show this text
    -port                   port on which to run local Python package index (default: 8080)
    -skip-jupyterlab        run a JupyterLab build (default: false)
    -skip-jupyter-notebook  run a Jupyter Notebook build (default: false)
    -skip-dist-build        skip building a new distribution version of pydeck (default: false)"

YELLOW='\033[0;33m'
NC='\033[0m' # No Color

for ARGUMENT in "$@"
do

  KEY=$(echo $ARGUMENT | cut -f1 -d=)
  VALUE=$(echo $ARGUMENT | cut -f2 -d=)   

  case "$KEY" in
    -h)                       echo "$USAGE" && exit ;;
    -port)                    PORT=${VALUE} ;;
    -skip-dist-build)         SKIP_DIST_BUILD=1 ;;     
    -skip-jupyterlab)         SKIP_JUPYTERLAB=1 ;;     
    -skip-jupyter-notebook)   SKIP_JUPYTER_NOTEBOOK=1 ;;     
    *)                        echo "invalid argument $KEY" && echo "$USAGE" && exit ;;
  esac    
done

PORT=${PORT:-8080}
SKIP_DIST_BUILD=${SKIP_DIST_BUILD:-0}
SKIP_JUPYTERLAB=${SKIP_JUPYTERLAB:-0}
SKIP_JUPYTER_NOTEBOOK=${SKIP_JUPYTER_NOTEBOOK:-0}

if [[ -z `pip list | grep pypiserver` ]]; then
  printf "$YELLOW  Installing pypiserver... $NC\n"
  pip install pypiserver
fi

# Check if port taken
nc -z -v -G5 localhost $PORT &> /dev/null
result=$?
if [ "$result" == 0 ]; then
  echo "Port $PORT occupied. Please use a different port or free this one."
  exit 1
fi


if [ "$SKIP_DIST_BUILD" ]; then
  printf "$YELLOW  Skipping dist build, serving builds that are present $NC\n"
else
  printf "$YELLOW  Building pydeck distribution from current branch $NC\n"
  python ../../setup.py sdist bdist_wheel
fi

# Starts a local pypi server
pypiserver -p $PORT ../../dist/ &
PYPISERVER_PID=$!

function cleanup_pypi_server {
  kill $PYPISERVER_PID
}
trap cleanup_pypi_server EXIT

# # All of these variables are used within the Docker builds
# export PYDECK_VERSION=`python -c "import pydeck; print(pydeck.__version__)"`
# export DECKGL_VERSION=`python -c "import pydeck; print(pydeck.frontend_semver.DECKGL_SEMVER)"`
export PYPI_INSTALL_URL=http://localhost:$PORT

function jupyterlab_setup {
  pip install jupyterlab
  pip install ipywidgets
  pip install numpy
  jupyter serverextension enable --py jupyterlab --sys-prefix
  pip install -i $PYPI_INSTALL_URL --extra-index-url https://pypi.org/simple pydeck==$PYDECK_VERSION --pre
  jupyter labextension install @jupyter-widgets/jupyterlab-manager
  jupyter labextension install @deck.gl/jupyter-widget@$DECKGL_VERSION
  jupyter lab --no-browser &> /dev/null &
  JUPYTERLAB_PID=$!
  return $JUPYTERLAB_PID
}

function jupyter_notebook_setup {
  pip install jupyter
  pip install ipywidgets
  pip install -i $PYPI_INSTALL_URL --extra-index-url https://pypi.org/simple pydeck==$PYDECK_VERSION --pre
  jupyter nbextension install --sys-prefix --symlink --overwrite --py pydeck
  jupyter nbextension enable --sys-prefix --py pydeck
  jupyter notebook --no-browser &> /dev/null &
  JUPYTER_NOTEBOOK_PID=$!
  return $JUPYTER_NOTEBOOK_PID
}

function activate {
  source ./env/bin/activate
  printf "$YELLOW  Using python at `which python` $NC\n"
}

function fresh_env {
  printf "$YELLOW  Creating new virtual envrionment $NC\n"
  rm -rf ./env
  python3 -m venv env
}

fresh_env()
activate()

function clean_jl {
  kill $JL_PID
}
trap clean_jl EXIT 

function clean_jn {
  kill $JN_PID
}
trap clean_jn EXIT 

if [ "$SKIP_JUPYTERLAB" ]; then
  printf "$YELLOW  Skipping JupyterLab build $NC\n"
else
  printf "$YELLOW  Running JupyterLab build $NC\n"
  JL_PID=`jupyterlab_setup()`
fi

if [ "$SKIP_JUPYTER_NOTEBOOK" ]; then
  printf "$YELLOW  Skipping Jupyter Notebook build $NC\n"
else
  printf "$YELLOW  Running Jupyter Notebook build $NC\n"

  JL_PID=`jupyter_notebook_setup()`
fi

control_c()
{
  exit 0
}

trap control_c SIGINT

printf "$YELLOW  Jupyter Notebook running at http://locahost:8888\n"
printf "$YELLOW  JupyterLab running at http://locahost:8889\n"
printf "$YELLOW  Ctrl+C to Exit\n"
read -r -d '' _ </dev/tty
