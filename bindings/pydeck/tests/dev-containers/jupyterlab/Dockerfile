FROM jupyter/minimal-notebook:latest

USER root

ARG PYDECK_VERSION
ARG PYPI_INSTALL_URL
ARG JUPYTER_TOKEN

RUN test -n "$PYDECK_VERSION"
RUN test -n "$PYPI_INSTALL_URL"

ENV JUPYTER_TOKEN=$JUPYTER_TOKEN

RUN echo "Installing $PYDECK_VERSION of pydeck from $PYPI_INSTALL_URL"

RUN pip install jupyterlab && \ 
    pip install ipywidgets && \
    pip install numpy && \
    jupyter serverextension enable --py jupyterlab --sys-prefix && \
    pip install -i $PYPI_INSTALL_URL --extra-index-url https://pypi.org/simple pydeck==$PYDECK_VERSION --pre && \
    jupyter labextension install @jupyter-widgets/jupyterlab-manager && \
    jupyter labextension install @deck.gl/jupyter-widget@8.1.0-alpha.6

ADD test.ipynb .

EXPOSE 8888
CMD ["jupyter", "lab", "--allow-root"]
