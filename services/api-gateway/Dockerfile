FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy source and compiled files
COPY . .

EXPOSE 3001

CMD ["node", "dist/index.js"]
