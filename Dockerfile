FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy application
COPY . .

# Install dependencies
RUN pnpm install

# Railway automatically injects these environment variables
# We just need to declare them so they're properly used by the application
ENV PONDER_RPC_URL_1=$PONDER_RPC_URL_1
ENV PONDER_RPC_URL_130=$PONDER_RPC_URL_130
ENV PONDER_RPC_URL_137=$PONDER_RPC_URL_137
ENV PONDER_RPC_URL_8453=$PONDER_RPC_URL_8453
ENV PONDER_RPC_URL_747474=$PONDER_RPC_URL_747474
ENV DATABASE_URL=$DATABASE_URL
ENV RAILWAY_DEPLOYMENT_ID=$RAILWAY_DEPLOYMENT_ID

# Run the start command
WORKDIR /app/apps/ponder
CMD pnpm start --schema "$RAILWAY_DEPLOYMENT_ID"
