FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the Next.js app
#RUN npm run build

EXPOSE 3000

# Start the Next.js app
CMD ["npm", "dev"]