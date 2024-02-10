FROM node:16-slim AS builder

RUN apt-get update -y && apt-get install -y openssl
# Set working directory
WORKDIR /app/

# Copy package files separately to cache dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npx prisma generate && npm run build

# Set default command
CMD ["bash", "docker-cmd.sh"]
