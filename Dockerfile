FROM node:23-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

#RUN npm install -g npm @latest
RUN npm install

COPY . .

RUN npm run build

RUN addgroup -S appuser && adduser -S appuser -G appuser

RUN chown -R appuser:appuser /app/log

USER appuser

CMD ["node", "dist/index.js"]
