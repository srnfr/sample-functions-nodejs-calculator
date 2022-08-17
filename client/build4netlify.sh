#!/bin/bash

## For netlify
cd client
##

rm -rf dist/
mkdir dist; 
sed -e "s|%%FUNCTION_API_URL%%|${FUNCTION_API_URL}|" -e "s|%%PUBLIC_URL%%|${DEPLOY_URL}|" index.html > dist/index.html;

cp -R assets dist/
