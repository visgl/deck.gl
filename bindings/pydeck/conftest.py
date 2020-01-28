import sys

collect_ignore = ["setup.py"]
if sys.version_info[0] < 3:
    collect_ignore.append('tests/browser')
