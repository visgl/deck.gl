#!/bin/sh
# Script to check code styles

set -e

# https://serverfault.com/questions/59262/bash-print-stderr-in-red-color
color()(set -o pipefail;"$@" 2>&1>&3|sed -E $'s,^.*.md,\e[33m&\e[m,'|sed -E $'s,MD[a-zA-Z0-9/\\-]+,\e[31m&\e[m,'|sed -E $'s,\\[Context: .*\\],\e[90m&\e[m,'>&2)3>&1

color markdownlint docs
