#!/bin/bash

set -e

PWD=`pwd`
GOOD_LINKS=()
BAD_LINKS=()

verify_local_file() {
  # echo "${PWD}${1}" 
  if [ -e "${PWD}${1}" ]; then
    GOOD_LINKS+=("$1")
    echo -e "\033[92mok\033[0m $1"
  else
    BAD_LINKS+=("$1")
    echo -e "\033[91mmissing\033[0m $1"
  fi
}

verify_url() {
  if curl -L --output /dev/null --silent --head --fail $1; then
    GOOD_LINKS+=("$1")
    echo -e "\033[92mok\033[0m $1"
  else
    BAD_LINKS+=("$1")
    echo -e "\033[91mmissing\033[0m $1"
  fi
}

echo -e "\033[93mGathering links in docs...\033[0m"
FILES=`find docs | grep .md$`

for f in ${FILES[@]};
  do
    echo -e "\033[1m$f\033[0m"
    # Get all the URLs out of markdown links in the form of [alt text](url)
    LINKS=`grep -o -E "\[.*?\]\(.+?\)" "${f}" | sed -e 's/\[.*\](\(.*\))/\1/' | sed -e 's/#[^#]*$//'`

    for link in ${LINKS[@]};
      do
        if [[ $link =~ ^/ ]]; then
          verify_local_file $link
        fi

        if [[ $link =~ ^http ]]; then
          verify_url $link
        fi
    done

    echo
done

if [ -z "${BAD_LINKS}" ]; then
  echo -e "\033[92mAll links ok\033[0m $1"
else
  echo -e "\033[91mFound ${#BAD_LINKS[@]} bad links!\033[0m $1"
  exit 1
fi
