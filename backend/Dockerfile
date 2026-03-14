# Dockerfile for Aura Backend (Node.js + Python + rembg)

# Stage 1: Build Node.js application
FROM node:18-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime environment
FROM node:18-slim
WORKDIR /app

# Install Python and system dependencies for ONNX/OpenCV
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy Node.js build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy Python scripts and requirements from builder
COPY --from=builder /app/requirements.txt .
COPY --from=builder /app/bg_remover.py .

# Install Python dependencies using venv to avoid PEP 668 external managed environment errors
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt

# Create uploads directory
RUN mkdir -p uploads/temp

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "dist/server.js"]
