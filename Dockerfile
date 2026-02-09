FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY backend ./backend
COPY frontend ./frontend
RUN ln -sf /app/frontend /app/backend/public
EXPOSE 10000
CMD ["node", "backend/src/server.js"]