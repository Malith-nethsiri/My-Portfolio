from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.api import auth, portfolio, projects, blog, money, public
from app.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="MyPortfolio API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(portfolio.router, prefix="/api", tags=["portfolio"])
app.include_router(projects.router, prefix="/api", tags=["projects"])
app.include_router(blog.router, prefix="/api", tags=["blog"])
app.include_router(money.router, prefix="/api", tags=["money"])
app.include_router(public.router, prefix="/api/public", tags=["public"])

uploads_dir = Path(__file__).resolve().parent.parent / "uploads"
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")


@app.get("/health")
async def health_check():
    return {"status": "ok"}
