#!/bin/sh

cd ../web/
npm run build
cd ../server/
ssh -i ./ssh-company-key-pair.pem ubuntu@ec2-3-98-225-101.ca-central-1.compute.amazonaws.com 'rm -rf /home/ubuntu/prod/CourseGroupChat/server/build/'
npm run build
scp -i ./ssh-company-key-pair.pem -r ./build/ ubuntu@ec2-3-98-225-101.ca-central-1.compute.amazonaws.com:/home/ubuntu/prod/CourseGroupChat/server/
rm -rf ./build
ssh -i ./ssh-company-key-pair.pem ubuntu@ec2-3-98-225-101.ca-central-1.compute.amazonaws.com << EOF
    killall node
    cd /home/ubuntu/prod/
    pm2 start ecosystem.config.js
EOF
