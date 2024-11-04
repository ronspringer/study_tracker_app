# Use the official Node.js image
FROM node:16 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./ 

# Install dependencies
RUN npm install 

# Copy the rest of your application code
COPY . . 

# Build the app
RUN npm run build 

# Use a lightweight server to serve the build
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html 

# Copy the default NGINX configuration and modify it
RUN echo "server { \
    listen 3000; \
    listen [::]:3000; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
    error_page 404 /index.html; \
}" > /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000 

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
