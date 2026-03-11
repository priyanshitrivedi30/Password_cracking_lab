# ─────────────────────────────────────────────────────────────
# Use slim image — reduces size from ~1GB to ~200MB
# ─────────────────────────────────────────────────────────────
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# ─────────────────────────────────────────────────────────────
# Install system dependencies needed by psycopg2 and bcrypt
# ─────────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# ─────────────────────────────────────────────────────────────
# Install Python dependencies first (layer caching)
# If requirements.txt hasn't changed, this layer is cached
# ─────────────────────────────────────────────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ─────────────────────────────────────────────────────────────
# Copy application code
# .dockerignore should exclude: __pycache__, .env, .git
# ─────────────────────────────────────────────────────────────
COPY . .

# ─────────────────────────────────────────────────────────────
# ✅ Set WORDLIST_DIR so generator.py finds intermediate.txt
# intermediate.txt is in backend/ which maps to /app inside container
# ─────────────────────────────────────────────────────────────
ENV WORDLIST_DIR=/app

# ─────────────────────────────────────────────────────────────
# ✅ Run as non-root user for security
# ─────────────────────────────────────────────────────────────
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose API port
EXPOSE 8000

# ─────────────────────────────────────────────────────────────
# ✅ Health check — Docker marks container unhealthy if /health fails
# Matches the /health endpoint we added in main.py
# ─────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# ─────────────────────────────────────────────────────────────
# ✅ No --reload in production
# Use --workers 2 for handling concurrent lab sessions
# ─────────────────────────────────────────────────────────────
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--timeout-keep-alive", "120"]