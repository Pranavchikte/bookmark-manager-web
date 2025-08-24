# === Stage 1: The "Builder" (Our Messy Kitchen) ===
# Use a Node.js base image
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy the dependency files
COPY package*.json ./

# Install all dependencies (including development ones needed for the build)
RUN npm install

# Copy the rest of the source code
COPY . .

# Run the build command to create the optimized production app
RUN npm run build


# === Stage 2: The "Production" (Our Clean Storefront) ===
# Start from a fresh, clean base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy only the necessary build artifacts from the "builder" stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Expose the port the app will run on
EXPOSE 3000

# The command to start the optimized Next.js server
CMD ["node", "server.js"]