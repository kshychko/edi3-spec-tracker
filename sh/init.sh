#!/bin/bash

eval $(ssh-agent -s)
ssh-add ~/.ssh/id_rsa
ssh-keyscan -H github.com > /etc/ssh/ssh_known_hosts

cd /opt
git clone git@github.com:edi3/edi3.github.io.git
git clone git@github.com:edi3/edi3-billing.git
git clone git@github.com:edi3/edi3-code.git
git clone git@github.com:edi3/edi3-dcp.git
git clone git@github.com:edi3/edi3-dcl.git
git clone git@github.com:edi3/edi3-idp.git
git clone git@github.com:edi3/edi3-nry.git
git clone git@github.com:edi3/edi3-json.git
git clone git@github.com:edi3/edi3-ordering.git
git clone git@github.com:edi3/edi3-tap.git
git clone git@github.com:edi3/edi3-tap-gw.git
cp -rf /opt/edi3.github.io/. /srv/jekyll
cd /srv/jekyll
BUNDLE_SPECIFIC_PLATFORM=true bundle install
bundle exec jekyll build
rm -rf /srv/jekyll/*

echo -e "init complete"
