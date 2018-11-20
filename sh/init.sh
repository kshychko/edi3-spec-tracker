#!/bin/bash

eval $(ssh-agent -s)
ssh-add ~/.ssh/id_rsa
ssh-keyscan -H github.com > /etc/ssh/ssh_known_hosts

cd /opt
git clone git@github.com:edi3/edi3.github.io.git
git clone git@github.com:edi3/edi3-api-conformance.git
git clone git@github.com:edi3/edi3-api-ndr.git
git clone git@github.com:edi3/edi3-description.git
git clone git@github.com:edi3/edi3-discovery.git
git clone git@github.com:edi3/edi3-events.git
git clone git@github.com:edi3/edi3-finance.git
git clone git@github.com:edi3/edi3-identity.git
git clone git@github.com:edi3/edi3-json-ld-ndr.git
git clone git@github.com:edi3/edi3-model-interchange.git
git clone git@github.com:edi3/edi3-notary.git
git clone git@github.com:edi3/edi3-regulatory.git
git clone git@github.com:edi3/edi3-trade.git
git clone git@github.com:edi3/edi3-transport.git
git clone git@github.com:edi3/edi3-uml-profile.git
git clone git@github.com:edi3/edi3-unlocode.git
cp -rf /opt/edi3.github.io/. /srv/jekyll
cd /srv/jekyll
BUNDLE_SPECIFIC_PLATFORM=true bundle install
bundle exec jekyll build
rm -rf /srv/jekyll/*

echo -e "init complete"
