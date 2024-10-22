FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
COPY .env ./

RUN npm run build