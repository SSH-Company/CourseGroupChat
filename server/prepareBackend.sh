#!/bin/sh

ssh -i ./ssh-company-key-pair.pem ubuntu@ec2-3-97-116-200.ca-central-1.compute.amazonaws.com 'rm -rf /home/ubuntu/dev/CourseGroupChat/server/build/'
npm run build
scp -i ./ssh-company-key-pair.pem -r ./build/ ubuntu@ec2-3-97-116-200.ca-central-1.compute.amazonaws.com:/home/ubuntu/dev/CourseGroupChat/server/
rm -rf ./build

