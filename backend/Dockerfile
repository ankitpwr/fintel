FROM oven/bun:1.3.12-alpine AS build

WORKDIR /app

COPY package.json bun.lock ./

COPY src/agent/evals/scripts/patch-deepeval.mjs ./src/agent/evals/scripts/patch-deepeval.mjs

RUN bun install --frozen-lockfile

COPY . .

RUN DATABASE_URL=postgresql://dummy:dummy@localhost/dummy bunx prisma generate

FROM oven/bun:1.3.12-alpine AS production

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --production --ignore-scripts

COPY --from=build /app/src ./src

EXPOSE 3000

