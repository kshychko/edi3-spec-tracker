#!/bin/bash

eval $(ssh-agent -s)
ssh-add ~/.ssh/id_rsa
ssh-keyscan -H github.com > /etc/ssh/ssh_known_hosts

cd /opt
mkdir tags
REPO_NAMES=("edi3.github.io" "edi3-api-conformance" "edi3-api-ndr" "edi3-description" "edi3-discovery" 
            "edi3-events" "edi3-finance" "edi3-identity" "edi3-json-ld-ndr" 
            "edi3-model-interchange" "edi3-notary" "edi3-regulatory" "edi3-trade"
            "edi3-transport" "edi3-uml-profile" "edi3-unlocode"
            "edi3-invoice" "edi3-order" "edi3-dictionary" "edi3-codelists")

## now loop through the above array
for i in "${REPO_NAMES[@]}"
do
git clone git@github.com:edi3/${i}.git
mkdir tags/${i}
done

cp -rf /opt/edi3.github.io/. /srv/jekyll
cd /srv/jekyll
BUNDLE_SPECIFIC_PLATFORM=true bundle install
bundle exec jekyll build
rm -rf /srv/jekyll/*

echo -e "init complete"
