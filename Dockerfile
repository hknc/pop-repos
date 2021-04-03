FROM node:14-alpine

WORKDIR /app

ADD package.json /app
ADD yarn.lock /app

RUN yarn

ADD . /app 

RUN yarn run build

EXPOSE 3000

CMD ["yarn", "start:production"]