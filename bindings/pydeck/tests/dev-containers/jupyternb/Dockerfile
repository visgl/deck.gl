FROM jupyter/minimal-notebook:latest

USER root

ARG PYDECK_VERSION
ARG PYPI_INSTALL_URL
ARG JUPYTER_TOKEN

RUN test -n "$PYDECK_VERSION"
RUN test -n "$PYPI_INSTALL_URL"

RUN echo "Installing $PYDECK_VERSION of pydeck from $PYPI_INSTALL_URL"

ENV JUPYTER_TOKEN=$JUPYTER_TOKEN

RUN pip install jupyter && \ 
    pip install ipywidgets && \
    pip install -i $PYPI_INSTALL_URL --extra-index-url https://pypi.org/simple pydeck==$PYDECK_VERSION --pre && \
    jupyter nbextension install --sys-prefix --symlink --overwrite --py pydeck && \
    jupyter nbextension enable --sys-prefix --py pydeck

ADD test.ipynb .

EXPOSE 8888
CMD ["jupyter", "notebook", "--allow-root"]
