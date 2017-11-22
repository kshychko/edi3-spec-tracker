#!/bin/bash

# Parse options
while getopts ":n:m:u:t:r:a:b:c:" opt; do
    case $opt in
        n)
            echo -e "\nREPO_NAME: -${OPTARG}"
            REPO_NAME="${OPTARG}"
            ;;
        u)
            echo -e "\nREPO_URL: -${OPTARG}"
            REPO_URL="${OPTARG}"
            ;;
        t)
            echo -e "\nTARGET_REPO_NAME: -${OPTARG}"
            TARGET_REPO_NAME="${OPTARG}"
            ;;
        r)
            echo -e "\nTARGET_REPO_URL: -${OPTARG}"
            TARGET_REPO_URL="${OPTARG}"
            ;;
        a)
            echo -e "\nCOMMIT_AUTHOR_NAME: -${OPTARG}"
            COMMIT_AUTHOR_NAME="${OPTARG}"
            ;;
        b)
            echo -e "\nCOMMIT_AUTHOR_EMAIL: -${OPTARG}"
            COMMIT_AUTHOR_EMAIL="${OPTARG}"
            ;;
        c)
            echo -e "\nCOMMIT_MESSAGE: -${OPTARG}"
            COMMIT_MESSAGE="${OPTARG}"
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


git config --global user.email "specs.tracker@edi3.org"

git config --global user.name "Specification Tracker"

git add /opt/$TARGET_REPO_NAME/specs/*

git commit -m "update specifications pages due to commit \"$COMMIT_MESSAGE\" to \"$REPO_NAME\""

git reset --hard HEAD

git pull --rebase

git push origin master

