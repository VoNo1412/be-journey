# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the source code
COPY . .

# Build the NestJS app
RUN npm run build

# Expose the port NestJS runs on
EXPOSE 3000

# Start the app
CMD ["node", "dist/main"]
