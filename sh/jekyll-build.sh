#!/bin/bash

# Parse options
while getopts ":t:" opt; do
    case $opt in
        t)
            echo -e "\nTARGET_REPO_NAME: -${OPTARG}"
            TARGET_REPO_NAME="${OPTARG}"
            ;;
        \?)
            echo -e "\nInvalid option: -${OPTARG}"
            usage
            ;;
        :)
            echo -e "\nOption -${OPTARG} requires an argument"
            usage
            ;;
     esac
done


rm -rf /srv/jekyll/*
cp -rf /opt/$TARGET_REPO_NAME/. /srv/jekyll
rm -rf /opt/$TARGET_REPO_NAME/specs/*


cd /srv/jekyll
BUNDLE_SPECIFIC_PLATFORM=true bundle install
RESULT=$?
if [[ ${RESULT} -ne 0 ]]; then
	echo -e "\nCan't bundle install"
	exit
fi

bundle exec jekyll build
RESULT=$?
if [[ ${RESULT} -ne 0 ]]; then
	echo -e "\nCan't bundle exec jekyll build"
	exit 1
fi

cp -rf /srv/jekyll/_site/specs/. /opt/$TARGET_REPO_NAME/specs



