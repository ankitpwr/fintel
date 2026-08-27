FROM oven/bun:1-alpine AS build

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

RUN DATABASE_URL=postgresql://dummy:dummy@localhost/dummy bunx prisma generate

FROM oven/bun:1-alpine AS production

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --production --ignore-scripts

COPY --from=build /app/src ./src

EXPOSE 3000

