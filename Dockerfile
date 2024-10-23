FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
ENV NODE_ENV=Production
RUN npm install

COPY . .
COPY .docker.env ./

RUN npm run build