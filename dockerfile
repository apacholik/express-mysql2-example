FROM node:20-alpine
RUN apk update && apk add dumb-init
ENV NODE_ENV=production
WORKDIR /app
COPY --chown=node:node package.json .
COPY --chown=node:node yarn.lock .
RUN yarn install --frozen-lockfile
COPY --chown=node:node . .

EXPOSE 3000

USER node
CMD ["dumb-init", "node", "app.js"]