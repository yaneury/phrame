import os
from contextlib import asynccontextmanager
from random import randint
from typing import Union

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic_settings import BaseSettings

data = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Generate nonce used to pin this specific deployment
    data['nonce'] = randint(1, 1 << 32)
    yield

class Settings(BaseSettings):
    content_directory: str

settings = Settings()
app = FastAPI(lifespan=lifespan)
app.mount("/static", StaticFiles(directory=settings.content_directory), name="static")

@app.get("/nonce")
def info():
    return data["nonce"]

@app.get("/content")
def content():
    return {
        "files": os.listdir(settings.content_directory)
    }

@app.get("/__debug")
def info():
    return {
        "nonce": data["nonce"],
        "content_directory": settings.content_directory,
        "content_base": "/static"
    }

