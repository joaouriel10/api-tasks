FROM node:18-alpine3.19 as build

RUN npm install -g pnpm

WORKDIR /usr/src/app

COPY pnpm-lock.yaml package.json ./

RUN pnpm install
RUN pnpm prisma db push

COPY .env ./
COPY . .

RUN pnpm prisma generate

EXPOSE 3011

CMD ["pnpm", "run", "start:dev"]
