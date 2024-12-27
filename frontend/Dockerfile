# frontend/Dockerfile
FROM node:20.18.1

WORKDIR /frontend

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]