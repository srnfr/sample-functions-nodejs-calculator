#!/bin/bash

## For netlify
cd client
echo "FUNCTION_API_URL = ${FUNCTION_API_URL}"
echo "DEPLOY_URL =  ${DEPLOY_URL}"
echo "DATABASE_URL = ${DATABASE_URL}"
##

rm -rf dist/
mkdir dist; 
sed -e "s|%%FUNCTION_API_URL%%|${FUNCTION_API_URL}|" -e "s|%%PUBLIC_URL%%|${DEPLOY_URL}|" index.html > dist/index.html;

cp -R assets dist/
