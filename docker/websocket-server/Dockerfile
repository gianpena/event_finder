FROM node:24-alpine
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

RUN npm init -y && npm pkg set type="module"
RUN npm install socket.io mysql2 express cors
COPY ./socket-server.js /app/socket-server.js

CMD ["node", "socket-server.js"]