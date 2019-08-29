FROM python:3.7-slim
RUN pip install --no-cache-dir notebook==5.*

RUN apt-get update
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_11.x  | bash -
RUN apt-get -y install nodejs

ENV HOME=/tmp
COPY . ${HOME}
WORKDIR ${HOME}/bindings/python/pydeck

RUN pip install -r requirements.txt \
    && pip install -r requirements-dev.txt \
    && pip install -e .
RUN jupyter nbextension install --py --symlink --sys-prefix pydeck \
    && jupyter nbextension enable --py --sys-prefix pydeck

ARG NB_USER=jovyan
ARG NB_UID=1000
ENV USER ${NB_USER}
ENV NB_UID ${NB_UID}
ENV HOME /home/${NB_USER}

RUN adduser --disabled-password \
    --gecos "Default user" \
    --uid ${NB_UID} \
    ${NB_USER}

USER root
RUN chown -R ${NB_UID} ${HOME}
USER ${NB_USER}
