FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install --force --no-audit --no-fund

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]