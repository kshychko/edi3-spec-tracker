#!/bin/bash

eval $(ssh-agent -s)
ssh-add ~/.ssh/id_rsa
ssh-keyscan -H github.com > /etc/ssh/ssh_known_hosts

cd /opt
git clone git@github.com:edi3/edi3.github.io.git
git clone git@github.com:edi3/edi3-finance.git
git clone git@github.com:edi3/edi3-methodology.git
git clone git@github.com:edi3/edi3-rdp.git
git clone git@github.com:edi3/edi3-regulatory.git
git clone git@github.com:edi3/edi3-trade.git
git clone git@github.com:edi3/edi3-transport.git
cp -rf /opt/edi3.github.io/. /srv/jekyll
cd /srv/jekyll
BUNDLE_SPECIFIC_PLATFORM=true bundle install
bundle exec jekyll build
rm -rf /srv/jekyll/*

echo -e "init complete"
