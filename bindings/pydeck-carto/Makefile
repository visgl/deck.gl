VENV=env
BIN=$(VENV)/bin

init:
	test `command -v python3` || echo Please install python3
	[ -d $(VENV) ] || python3 -m venv $(VENV)
	$(BIN)/pip install -r requirements_dev.txt
	$(BIN)/pip install -e .

lint:
	$(BIN)/black pydeck_carto tests examples setup.py
	$(BIN)/flake8 pydeck_carto tests examples setup.py

test:
	$(BIN)/pytest tests pydeck_carto

publish-pypi:
	rm -rf ./dist/*
	$(BIN)/python setup.py sdist bdist_wheel
	$(BIN)/twine upload dist/*

publish-test-pypi:
	rm -rf ./dist/*
	$(BIN)/python setup.py sdist bdist_wheel
	$(BIN)/twine upload --repository-url https://test.pypi.org/legacy/ dist/* --verbose

clean:
	rm -rf venv
