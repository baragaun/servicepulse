FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@10.5.2

# Copy package.json and pnpm-lock.yaml (if exists)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the TypeScript project
RUN pnpm build

# Production stage
FROM node:18.19-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@10.5.2

# Copy package.json
COPY package.json ./

# Install only production dependencies
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Create a non-root user
RUN addgroup -S appuser && adduser -S appuser -G appuser
USER appuser

# Expose the port
EXPOSE 3000

# Command to run the app
CMD ["node", "--env-file=.env", "dist/index.js"]
