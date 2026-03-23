FROM node:24-slim AS builder
WORKDIR /app
RUN npm install -g pnpm

# Install dependencies from web's package.json
COPY Frontend/web/package.json ./
RUN pnpm install --no-frozen-lockfile

# Copy web source into /app and shared into /shared
# mirrors local structure: Frontend/web -> /app, Frontend/shared -> /shared
# relative imports (../../../../shared/...) resolve correctly in both envs
COPY Frontend/web .
COPY Frontend/shared ../shared

ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm run build

FROM nginx
EXPOSE 8080
COPY Frontend/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html