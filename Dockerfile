FROM node:12

# Create app directory
WORKDIR /usr/src/dev

COPY . .

RUN npm --prefix ./server i

EXPOSE 80

CMD [ "npm", "--prefix", "./server", "start" ]