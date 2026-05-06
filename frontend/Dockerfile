# Build stage
FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html
# Also expose the textures volume in Nginx for the block icons
# This assumes we map the same volume to both containers or use a symlink
# For simplicity, we'll suggest mapping the textures to /usr/share/nginx/html/textures in compose

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
