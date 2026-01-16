FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
# We use the PORT env variable or default to 4000
ENV PORT=4000
EXPOSE 4000
CMD ["node", "server.js"]
