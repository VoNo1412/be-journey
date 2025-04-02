# Use Node.js 20 (Debian-based for better compatibility)
FROM node:20 

# Set working directory
WORKDIR /app 

# Copy only package.json and package-lock.json to leverage Docker caching
COPY package*.json ./ 

# Install dependencies (without copying node_modules)
RUN npm install 

# Copy the rest of the application code
COPY . . 

# Build the app
RUN npm run build 

# Expose the application port
EXPOSE 3000 

# Start the application
CMD ["npm", "run", "start:prod"]
