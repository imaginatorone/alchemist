from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.router import router as auth_router
from app.library.router import router as library_router
from app.search.router import router as search_router
from app.models import Base
from app.database import engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Alchemist API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(library_router)
app.include_router(search_router)


@app.get("/")
def health():
    return {"status": "ok", "message": "Alchemist API is alive 🧪"}
