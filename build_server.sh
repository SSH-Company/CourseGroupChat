#!/bin/bash

#get current run
CURR="$(docker ps -qf publish=80)"

#update git repo
git pull

#install dependencies
npm --prefix ./server i

#build backend
npm --prefix ./server run build

#update docker image
docker build -t /home/ubuntu/dev .

docker kill ${CURR}
echo "starting server"
docker run -p 80:80 -d --restart=always /home/ubuntu/dev