FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV TOKEN=$TOKEN
ENV DEFAULT_ROLE=$DEFAULT_ROLE
ENV DEFAULT_COLOR=$DEFAULT_COLOR
ENV GUILD_ID=$GUILD_ID
ENV APPLICATION_ID=$APPLICATION_ID
CMD ["node", "index.js"]