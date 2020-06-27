help:
	@echo "Please use `make target` where target is one of"
	@echo "init - build deck.gl and install all requirements for development"
	@echo "test - run tests"
	@echo "fast-build - rebuild only @deck.gl/jupyter-widget"
	@echo "prepare-jupyter - initiate pydeck-related extensions in JupyterLab and Jupyter Notebook"
	@echo "bump-version - bump the version files for the pydeck frontend and backend"
	@echo "publish-pypi - prepare pydeck for publication to PyPI"
	@echo "publish-test-pypi - prepare pydeck for publication to the test.pypi.org"
	@echo "docs - builds the docs/ folder"
	@echo "release - package and upload a release"

init:
	# Build deck.gl at the root of this repository
	cd ../..; yarn bootstrap; cd -; \
	# Set up the pydeck project
	pip install -r requirements/requirements.txt; \
	pip install -r requirements/requirements-dev.txt; \
	pip install -e .

fast-build:
	cd ../../modules/jupyter-widget; webpack; cd -; \
	pip install -e .

pre-commit:
	python -m black . --target-version py34 && $(MAKE) test

pre-init:
	python3 -m venv env; \
	. env/bin/activate

prepare-jupyter:
	# Enable the notebook extension
	. env/bin/activate; \
	python -m jupyter nbextension install --sys-prefix --symlink --overwrite --py pydeck; \
	python -m jupyter nbextension enable --sys-prefix --py pydeck; \
	# Build and install the JS module
	cd ../../modules/jupyter-widget/; \
	python -m jupyter labextension install @jupyter-widgets/jupyterlab-manager --no-build; \
	python -m jupyter labextension install . --no-build; \
	python -m jupyter labextension link .; \
	python -m jupyter lab build; \
	cd ../../bindings/pydeck

test:
	. env/bin/activate; \
	python -m flake8 . && \
	python -m pytest --cov=pydeck 

bump-version:
	@read -p "Choose a release type {MAJOR, MINOR, PATCH, BETA, ALPHA, RC}:" choice; \
	python bump_version.py "$$choice";

publish-pypi:
	rm -rf ./dist/*
	pip install .
	python setup.py sdist bdist_wheel
	pip install twine
	python -m twine upload dist/*

publish-test-pypi:
	rm -rf ./dist/*
	pip install .
	python setup.py sdist bdist_wheel
	pip install twine
	python -m twine upload --repository-url https://test.pypi.org/legacy/ dist/*

release:
	$(MAKE) bump-version;
	$(MAKE) test;
	VERSION=$$(python -c "import pydeck; print(pydeck.__version__)");
	git commit -am "pydeck $$VERSION";
	$(MAKE) publish-pypi;

docs:
	cd docs/ && $(MAKE) docs
