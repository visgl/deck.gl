import glob
import json
import os
import logging


here = os.path.dirname(os.path.abspath(__file__))
fixture_path = os.path.join(here, "./fixtures/")
json_glob = os.path.join(fixture_path, "*.json")

fixtures = {}

for fname in glob.glob(json_glob):
    fixture_text = open(fname).read()
    fixture_name = os.path.basename(fname).replace(".json", "")
    fixtures[fixture_name] = fixture_text
