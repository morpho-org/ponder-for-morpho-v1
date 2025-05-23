FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/ponder/package.json ./apps/ponder/

# Install dependencies
RUN pnpm install

# Copy the rest of the application
COPY . .

# Railway automatically injects these environment variables
# We just need to declare them so they're properly used by the application
ENV PONDER_RPC_URL_1=$PONDER_RPC_URL_1
ENV PONDER_RPC_URL_130=$PONDER_RPC_URL_130
ENV PONDER_RPC_URL_137=$PONDER_RPC_URL_137
ENV PONDER_RPC_URL_8453=$PONDER_RPC_URL_8453
ENV DATABASE_URL=$DATABASE_URL
ENV RAILWAY_DEPLOYMENT_ID=$RAILWAY_DEPLOYMENT_ID

# Run the start command
WORKDIR /app/apps/ponder
CMD pnpm start --schema "$RAILWAY_DEPLOYMENT_ID"
