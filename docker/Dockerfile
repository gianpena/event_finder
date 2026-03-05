FROM node:24-alpine
WORKDIR /app

RUN apk add --no-cache git bash
COPY ./start.sh /app/start.sh
ARG PORT=3000
EXPOSE ${PORT}

ENTRYPOINT ["/app/start.sh"]