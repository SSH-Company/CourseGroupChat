#!/bin/bash

#get current run
CURR="$(sudo docker ps -qf publish=80)"

#install dependencies
npm --prefix ./server i

#build backend
npm --prefix ./server run build

#update docker image
sudo docker build -t home/ubuntu/dev .

sudo docker kill ${CURR}
echo "starting server"
sudo docker run -p 80:80 -d --restart=always home/ubuntu/dev