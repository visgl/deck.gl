FROM python:3.7-slim
RUN pip install --no-cache-dir notebook==5.*

RUN apt-get update
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_11.x  | bash -
RUN apt-get -y install nodejs
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update
RUN apt-get -y install yarn

RUN apt-get install -y g++-6 && \
    apt-get install -y mesa-utils && \
    apt-get install -y xvfb && \
    apt-get install -y libgl1-mesa-dri && \
    apt-get install -y libglapi-mesa && \
    apt-get install -y libosmesa6 && \
    apt-get install -y libxi-dev

ENV HOME=/tmp
COPY . ${HOME}
WORKDIR ${HOME}/bindings/python/pydeck

RUN pip install -r requirements.txt \
    && pip install -r requirements-dev.txt \
    && pip install -e . --install-option "--build_all"

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
