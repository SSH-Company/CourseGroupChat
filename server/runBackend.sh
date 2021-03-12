#!/bin/sh

kill -9 $(lsof -i :3000)
npm run start-dev