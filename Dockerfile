FROM node:22-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /workspace

COPY . .

RUN --mount=type=cache,id=pnpm0,target=/pnpm/store pnpm install --frozen-lockfile --prod --ignore-scripts

ENTRYPOINT ["./node_modules/.bin/ponder"]
CMD ["start", "--config", "apps/ponder/ponder.config.ts"]
