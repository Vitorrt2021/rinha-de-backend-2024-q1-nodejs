FROM node:16-slim AS builder

# Set working directory
WORKDIR /app/

# Copy package files separately to cache dependencies
COPY package*.json ./

# Install dependencies
RUN npm install --no-package-lock

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Set default command
CMD ["bash", "docker-cmd.sh"]
