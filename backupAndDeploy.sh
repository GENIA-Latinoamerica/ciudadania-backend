#!/bin/bash
#Script to run on Server side to backUp and deploy new code


echo "BackUp actual code..." 
sudo cp -R /opt/api/current/* /opt/api/old/

echo "Uncompressing file 'deploy.tgz' ..."
cd /opt/api/next/ || exit
sudo rm -R dist/
sudo rm -R node_modules/
sudo tar -xzf deploy.tgz > /dev/null 2>&1

echo "Copy files from /opt/api/next/node_modules to /opt/api/current/node_modules ..."
sudo cp -R /opt/api/next/node_modules/* /opt/api/current/node_modules
echo "Copy files from /opt/api/next/dist/apps to /opt/api/current/apps ..."
sudo cp -R /opt/api/next/dist/apps/* /opt/api/current/apps

cd /opt/api/current/ || exit

pm2 restart API-GATEWAY
pm2 restart API-AUTH
pm2 restart API-USER
pm2 restart API-NOTIFICATION
pm2 logs