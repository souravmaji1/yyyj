FROM node:18-alpine
WORKDIR /app
RUN npm i -g pm2

COPY . .
RUN npm install
ARG MODE=production
ENV MODE=${MODE}
RUN npm run build
EXPOSE 3000
#CMD ["npm", "run", "start"]
CMD if [ "$MODE" = "production" ]; then \
      pm2-runtime npm -- run start; \
    else \
      pm2-runtime npm -- run dev; \
    fi
