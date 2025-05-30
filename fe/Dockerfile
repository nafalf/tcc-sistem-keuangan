FROM node:18-alpine
WORKDIR /fe/
COPY public/ /fe/public
COPY src/ /fe/src
COPY package.json /fe/
RUN npm install
CMD ["npm", "start"]