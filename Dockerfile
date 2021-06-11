FROM node:12

ENV NODE_ENV production

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# If you are building your code for production
RUN npm install --only=production

#To bundle your app's source code inside the Docker image, use the COPY instruction:
COPY . .

#Your app binds to port 4000 so you'll use the EXPOSE instruction to have it mapped by the docker daemon:
EXPOSE 4000

CMD [ "node", "bin/www" ]
