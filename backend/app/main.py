from fastapi import FastAPI
from contextlib import asynccontextmanager
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

from app.core.database import engine, Base

# IMPORTANT: Import ALL models so tables are registered
from app.models import (
    user,
    lab_session,
    command_log,
    submission,
    analytics,
    leaderboard,
    disclaimer,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created successfully!")
    yield

app = FastAPI(
    title="Password Cracking Lab API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Routers ----------
app.include_router(auth.router)
app.include_router(overview.router)      # ✅ tools + concepts page
app.include_router(difficulty.router)    # ✅ difficulty selection
app.include_router(lab.router)
app.include_router(terminal.router)
app.include_router(submission_api.router)
app.include_router(analytics_api.router)
app.include_router(leaderboard_api.router)
app.include_router(session.router)

@app.get("/")
def root():
    return {"message": "Password Cracking Lab Backend Running"}