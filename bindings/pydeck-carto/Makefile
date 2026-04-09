VENV=.venv
DIST=dist
BUILD=build
BIN=$(VENV)/bin

init:
	test `command -v uv` || echo "Please install uv: https://docs.astral.sh/uv/getting-started/installation/"
	uv venv --python 3.13 $(VENV)
	uv pip install -r requirements/requirements-dev.txt
	uv pip install -e .

lint:
	$(BIN)/black pydeck_carto tests examples setup.py
	$(BIN)/flake8 pydeck_carto tests examples setup.py

test:
	$(BIN)/pytest tests --cov=pydeck_carto

test-scripts:
	for file in examples/scripts/*.py; do $(BIN)/python "$$file"; done

publish-pypi:
	rm -rf $(DIST) $(BUILD) *.egg-info
	$(BIN)/python setup.py sdist bdist_wheel
	$(BIN)/twine upload $(DIST)/*

publish-test-pypi:
	rm -rf $(DIST) $(BUILD) *.egg-info
	$(BIN)/python setup.py sdist bdist_wheel
	$(BIN)/twine upload --repository-url https://test.pypi.org/legacy/ $(DIST)/* --verbose

clean:
	rm -rf $(VENV) $(DIST) $(BUILD) *.egg-info

ci:
	$(MAKE) lint
	$(MAKE) test
