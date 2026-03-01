FROM node:24-alpine
WORKDIR /app
EXPOSE 8080

RUN npm init -y && npm pkg set type="module"
RUN npm install socket.io && npm install mysql2
COPY ./socket-server.js /app/socket-server.js

CMD ["node", "socket-server.js"]