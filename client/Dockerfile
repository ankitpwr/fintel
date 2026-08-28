FROM oven/bun:1.3.12-alpine AS build

WORKDIR /build

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

ARG VITE_CLIENT_ID

ARG VITE_BACKEND_URL

ENV VITE_CLIENT_ID=${VITE_CLIENT_ID}

ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

FROM nginx:alpine-otel

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /build/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
