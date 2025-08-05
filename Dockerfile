# Use the official Node.js image as a base
FROM node:18-alpine

# Install libc6-compat for Alpine
RUN apk add --no-cache libc6-compat

# Set the working directory inside the container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the application source code
COPY . .

# Expose the port
EXPOSE 3001

# Run the application
CMD ["npm", "start"]