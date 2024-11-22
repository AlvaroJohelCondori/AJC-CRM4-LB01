# Check out https://hub.docker.com/_/node to select a new base image
FROM node:16-slim

USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=node package*.json ./

RUN npm cache clean -f
RUN npm config set registry https://registry.npmjs.org/
RUN npm set strict-ssl false

RUN npm install

# Bundle app source code
COPY --chown=node . .

RUN npm run build

CMD [ "node", "." ]
