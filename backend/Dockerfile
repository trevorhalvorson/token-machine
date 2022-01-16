ARG PORT

FROM node:16 AS builder

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

# Install dependencies
RUN npm ci

COPY . .

# Compile
RUN npm run build

FROM node:16
ENV NODE_ENV=production

# Bundle app source
COPY --from=builder /app .

# Expose port
EXPOSE ${PORT}

# Start server
CMD [ "npm", "start" ]
