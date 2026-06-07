FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages ./packages
COPY apps ./apps
COPY modules ./modules
RUN npm ci
CMD ["npm", "run", "build"]

