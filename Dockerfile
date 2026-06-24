# Stage 1: Build
FROM node:24.17.0-alpine AS builder
WORKDIR /usr/src/app

COPY package.json yarn.lock  ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Stage 2: Production
FROM node:24.17.0-alpine AS deploy
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

EXPOSE ${PORT}
CMD ["node", "dist/main.js"]