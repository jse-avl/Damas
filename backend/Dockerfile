FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json tsconfig.json ./
COPY src ./src
RUN bun install
EXPOSE 4000
CMD ["bun", "src/index.ts"]
