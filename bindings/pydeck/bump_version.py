import argparse
import sys

import semver
import jinja2

from pydeck._version import __version__

RELEASE_TYPES = ["MAJOR", "MINOR", "PATCH", "BETA", "ALPHA", "RC"]


def bump(release_type):
    version_info = semver.parse_version_info(__version__)
    if release_type == "MAJOR":
        return version_info.bump_major()
    elif release_type == "MINOR":
        return version_info.bump_minor()
    elif release_type == "PATCH":
        return version_info.bump_patch()
    elif release_type == "ALPHA":
        return version_info.bump_prerelease(token="a")
    elif release_type == "BETA":
        return version_info.bump_prerelease(token="b")
    elif release_type == "RC":
        return version_info.bump_prerelease(token="rc")
    else:
        raise Exception(
            "Release type must be one of the following:", ", ".join(RELEASE_TYPES)
        )


def rewrite_version_file(semver):
    with open("pydeck/_version.py", "w+") as f:
        t = jinja2.Template("__version__ = '{{semver_str}}'")
        contents = t.render(semver_str=str(semver))
        f.write(contents)


parser = argparse.ArgumentParser(
    description="Bump semver for pydeck. Modifies pydeck/_version.py directly."
)
parser.add_argument(
    "release_type", action="store", choices=RELEASE_TYPES, help="Release type to bump"
)
parser.add_argument(
    "-y", "--yes", action="store_true", dest="yes", help="Automatically answer yes"
)


if __name__ == "__main__":
    args = parser.parse_args()
    should_accept_bump = args.yes
    bumped_version = bump(args.release_type)
    inform_bump = "Raising pydeck {} to {}".format(__version__, str(bumped_version))
    print(inform_bump)
    if not should_accept_bump:
        prompt = "Proceed? (Y/n) "
        response = input(prompt)
        if response != "Y":
            sys.exit(0)
    rewrite_version_file(bumped_version)
    print(bumped_version)
