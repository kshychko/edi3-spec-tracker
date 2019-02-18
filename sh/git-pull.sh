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


cd /opt/$TARGET_REPO_NAME
if [ -d "specs" ]; then
    echo -e "specs directory exists, no need to create"
    else
    mkdir "specs"
fi


## declare an array variable
REPO_NAMES=("edi3-api-conformance" "edi3-api-ndr" "edi3-description" "edi3-discovery" 
            "edi3-events" "edi3-finance" "edi3-identity" "edi3-json-ld-ndr" 
            "edi3-model-interchange" "edi3-notary" "edi3-regulatory" "edi3-trade"
            "edi3-transport" "edi3-uml-profile" "edi3-unlocode" "edi3-codelists" "edi3-icl")

## now loop through the above array
for i in "${REPO_NAMES[@]}"
do
	cd /opt/

	if [ -d "$i" ]; then
		cd /opt/$i
		mkdir docs
		cd docs
		git fetch --tags
		TAGS=$(git tag -l)
        for tag in "${TAGS[@]}"
        do
            mkdir ${tag}
            cd ${tag}
            git checkout ${tag}
            RESULT=$?
            if [[ ${RESULT} -ne 0 ]]; then
                echo -e "\nCan't pull ${i} repo"
                exit
            fi
            cd ..
		done
#		else
#		git clone $i
	fi
	cd /opt/$TARGET_REPO_NAME/specs
	if [ -d "$i" ]; then
		rm -rf $i
	fi

	mkdir $i

	cp -rf /opt/$i/docs/. /opt/$TARGET_REPO_NAME/specs/$i/
done


