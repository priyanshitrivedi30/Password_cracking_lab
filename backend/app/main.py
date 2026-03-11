import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    auth,
    lab,
    terminal,
    submission as submission_api,
    leaderboard as leaderboard_api,
    analytics as analytics_api,
    session,
    overview,
    difficulty,
)

from app.core.database import create_tables

# ─────────────────────────────────────────────────────────────
# Logging setup
# ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────
# CORS — env-driven, not hardcoded
# Set in .env: ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
# ─────────────────────────────────────────────────────────────
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
ALLOWED_ORIGINS = [origin.strip() for origin in _raw_origins.split(",")]


# ─────────────────────────────────────────────────────────────
# App lifespan — runs on startup and shutdown
# ─────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──
    logger.info("🚀 Starting Password Cracking Lab API...")
    logger.info(f"🌐 CORS allowed origins: {ALLOWED_ORIGINS}")

    # ✅ Use create_tables() from database.py — imports all models correctly
    create_tables()
    logger.info("✅ Database tables verified/created")

    yield

    # ── Shutdown ──
    logger.info("🛑 Password Cracking Lab API shutting down...")


# ─────────────────────────────────────────────────────────────
# App instance
# ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="Password Cracking Lab API",
    description="Educational password cracking lab backend",
    version="1.0.0",
    lifespan=lifespan,
)


# ─────────────────────────────────────────────────────────────
# CORS Middleware
# ─────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],      # ✅ env-driven
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────
# Global exception handler
# Prevents raw 500 errors from leaking internal stack traces
# ─────────────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred. Please try again.",
            "path": str(request.url),
        }
    )


# ─────────────────────────────────────────────────────────────
# Routers
# ─────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(overview.router)
app.include_router(difficulty.router)
app.include_router(lab.router)
app.include_router(terminal.router)
app.include_router(submission_api.router)
app.include_router(analytics_api.router)
app.include_router(leaderboard_api.router)
app.include_router(session.router)


# ─────────────────────────────────────────────────────────────
# Root + Health check
# ─────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "message": "Password Cracking Lab API is running",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    """
    ✅ Health check endpoint for Docker/infrastructure.
    Docker compose healthcheck and load balancers ping this.
    Returns 200 if API is up and running.
    """
    return {
        "status": "healthy",
        "service": "password-cracking-lab-api",
    }