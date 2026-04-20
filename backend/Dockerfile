FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
# Since you use Prisma, we need to generate the client
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]