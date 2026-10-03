import sys

collect_ignore = []
if sys.version_info[0] < 3:
    collect_ignore.append("tests/browser")
