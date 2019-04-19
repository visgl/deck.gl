# pydeck: A Python wrapper for deck.gl

[![Build Status](https://travis-ci.org/uber/pydeck.svg?branch=master)](https://travis-ci.org/uber/pydeck)
[![codecov](https://codecov.io/gh/uber/pydeck/branch/master/graph/badge.svg)](https://codecov.io/gh/uber/deck.gl)

A series of lightweight objects that can be combined to create a JSON blob that
is compliant with the deck.gl JSON API viewable in this repo at `modules/json`.

## Installation

You can install using `pip`:

```bash
pip install pydeck
```

Or if you use jupyterlab:

```bash
pip install pydeck
jupyter labextension install @jupyter-widgets/jupyterlab-manager
```

If you are using Jupyter Notebook 5.2 or earlier, you may also need to enable
the nbextension:

```bash
jupyter nbextension enable --py [--sys-prefix|--user|--system] pydeck
```
