Dockerized development tools
===============

Files in this directory can be used to spin up JupyterLab and Jupyter Notebook environments for rapid testing.

Ideally run this in an isolated Python 3.7 environment, with `pyppeteer` installed.
Docker and docker-compose are also required for these tools to work.

- `build-and-screenshot.sh` creates screenshots of the current state of the containers
- `snap.py` creates screenshots of the current state of the test.ipynb file
- `docker-compose up -d` will run two containerized Jupyter environments,
   one with JupyterLab and another with Jupyter Notebook, and install a specified build of pydeck.
   The `PYDECK_VERSION` and `PYPI_INSTALL_URL` can be used to specify the version of pydeck to download and test.
- `docker-compose down` will stop the containers this directory starts

An example use case would be testing a version of pydeck published to test.pypi.com.

This tool is only for local development.
