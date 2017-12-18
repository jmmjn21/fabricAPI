FROM node:6.9.5
MAINTAINER javier mansilla
RUN mkdir /api
ADD . /api
WORKDIR /api

RUN npm install -g swagger
RUN npm install

CMD swagger project start
