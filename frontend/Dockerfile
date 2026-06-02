FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json tsconfig.json vite.config.ts ./
COPY src ./src
COPY public ./public
RUN bun install
EXPOSE 3000
CMD ["bun", "run", "dev"]
