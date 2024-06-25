FROM node:18-alpine3.19 as build

WORKDIR /usr/src/app

RUN npm install -g pnpm

RUN apk update && apk add wget

RUN wget -O /usr/local/bin/dockerize https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-linux-amd64-v0.6.1.tar.gz \
    && tar -C /usr/local/bin -xzvf /usr/local/bin/dockerize \
    && chmod +x /usr/local/bin/dockerize

COPY pnpm-lock.yaml package.json ./

COPY .env ./

COPY . .

EXPOSE 3011
