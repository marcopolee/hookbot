FROM node:14.4-alpine

RUN mkdir app
WORKDIR app
COPY . .

RUN npm ci

EXPOSE 11337

ENTRYPOINT node index.js
