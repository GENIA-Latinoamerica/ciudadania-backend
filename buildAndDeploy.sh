#!/bin/bash
#Script to run on client side to buil, send to server and fire remote script for deploy

result=${PWD##*/}

if [ "$result" != 'dashboard-api' ]
then
  echo "Fail, you have to run the script inside the folder 'dashboard-api'"
  exit 0
fi

echo "Building projects..." 
nest build api-gateway
nest build api-auth
nest build api-user
nest build api-notification

echo "Searching for MODULE_NOT_FOUND errors..." 

moduleNotFoundErrors=$(grep -rnw 'dist/' -e 'MODULE_NOT_FOUND')
if [ ! -z "$moduleNotFoundErrors" ]
then
  i=1;
  while read n; do 
    echo "Number $i. $n"  
    i=$(($i+1)); 
  done <<< "$moduleNotFoundErrors"
  echo "Fail, one of the components have MODULE_NOT_FOUND errors, fix and try to build again"
  exit 0
fi

echo "Compressing folders 'apps' and 'node_modules' ..."
cp -R apps/api-notification/src/notification/templates dist/apps/api-notification
tar -czf /tmp/deploy.tgz dist/apps node_modules

echo "Sending compress file to server 18.205.18.231:/opt/api/next ..."
scp -P 22 -i "/opt/certs/dashboard-key.pem" /tmp/deploy.tgz ec2-user@18.205.18.231:/opt/api/next

echo "Start remote script on server for deploy ..."

ssh -i "/opt/certs/dashboard-key.pem" ec2-user@18.205.18.231 'cd /opt/api/;sh backUpAndDeploy.sh'