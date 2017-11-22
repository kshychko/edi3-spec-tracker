#!/bin/bash

# Parse options
while getopts ":i:o:v:t:" opt; do
    case $opt in
        i)
            echo -e "\ninput file: -${OPTARG}"
            INPUT="${OPTARG}"
            ;;
        o)
            echo -e "\noutput file: -${OPTARG}"
            OUTPUT="${OPTARG}"
            ;;
        v)
            echo -e "\ntheme variables: -${OPTARG}"
            THEME_VARIABLES="${OPTARG}"
            ;;
        t)
            echo -e "\ntheme template: -${OPTARG}"
            THEME_TEMPLATE="${OPTARG}"
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


swagger2aglio -i "${INPUT}" -o "${OUTPUT}" --theme-variables "${THEME_VARIABLES}" --theme-template "${THEME_TEMPLATE}"