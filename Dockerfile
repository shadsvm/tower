FROM oven/bun

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN bun install
RUN cd client && bun install

# Copy source code
COPY . .

# Build client
RUN cd client && bun run build

# Start server
CMD ["bun", "start"]
