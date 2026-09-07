VENV=.venv
BIN=$(VENV)/bin

help:
	@echo "\nPlease use \`make target\` where target is one of\n"
	@echo "init - build deck.gl and install all requirements for development"
	@echo "test - run tests"
	@echo "bump-version - bump the version files for the pydeck frontend and backend"
	@echo "publish-pypi - prepare pydeck for publication to PyPI"
	@echo "publish-test-pypi - prepare pydeck for publication to the test.pypi.org"
	@echo "release - package and upload a release"
	@echo "fast-build - rebuild @deck.gl/jupyter-widget"
	@echo "setup-env - detect basic requirements and set up a virtualenv using uv"
	@echo "pre-commit - run pre-commit hook for pydeck"

WIDGET_DIR=../../modules/jupyter-widget

# Copy the built @deck.gl/jupyter-widget bundles into pydeck/static (no rebuild)
copy-bundle:
	node scripts/build_widget.mjs --copy-only

init:
	. $(BIN)/activate; \
	yarn bootstrap; \
	yarn build
	$(MAKE) copy-bundle
	uv pip install -r requirements/requirements.txt && \
	uv pip install -r requirements/requirements-dev.txt && \
	SKIP_JUPYTER_BUILDER=1 uv pip install -e ".[jupyter]"

# Rebuild only the widget bundles (requires a prior `yarn build` at the repo root for the dist aliases)
fast-build:
	cd $(WIDGET_DIR) && yarn build
	$(MAKE) copy-bundle

pre-commit:
	$(BIN)/python -m black . && $(MAKE) test

setup-env:
	test `command -v uv` || echo "Please install uv: https://docs.astral.sh/uv/getting-started/installation/"
	test `command -v yarn` || echo Please install yarn
	test `command -v uv` && test `command -v yarn`
	uv venv --python 3.13 $(VENV)
#	avoid conflict between any js code in the venv and the root
	echo '{"type": "commonjs"}' > $(VENV)/package.json

test:
	$(BIN)/python -m flake8 . && \
	$(BIN)/python -m pytest --cov=pydeck

bump-version:
	@read -p "Choose a release type {MAJOR, MINOR, PATCH, BETA, ALPHA, RC}:" choice; \
	python bump_version.py "$$choice";

publish-pypi:
	uv pip install build twine
	rm -rf ./dist/*
	python -m build
	python -m twine upload dist/*

publish-test-pypi:
	uv pip install build twine
	rm -rf ./dist/*
	python -m build
	python -m twine upload --repository-url https://test.pypi.org/legacy/ dist/*

release:
	$(MAKE) bump-version
	$(MAKE) test
	VERSION=$$(python -c "import pydeck; print(pydeck.__version__)"); \
	git commit -am "pydeck $$VERSION"
	$(MAKE) publish-pypi

ci:
	$(MAKE) test
