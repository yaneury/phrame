from enum import Enum
import os
from contextlib import asynccontextmanager
from random import randint
from typing import Union

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pydantic_settings import BaseSettings

WHITELISTED_FILE_TYPES = [
    "jpg", # Picture
    "png", # Picture
    "mov", # Video
    "mp4", # Video
    "txt", # Text
]

data = {}

class Category(str, Enum):
    Picture = 'picture'
    Video = 'video'
    Text = 'text'

class File(BaseModel):
    filename: str
    category: Category

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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/nonce")
def info():
    return data["nonce"]

@app.get("/content")
def content():
    def _is_valid(filename: str) -> bool:
        for ext in WHITELISTED_FILE_TYPES:
            if (filename.endswith(ext)):
                return True
        
        return False

    def _categorize(filename: str) -> File:
        if (filename.endswith("jpg") or filename.endswith("png")):
            return File(filename=filename, category=Category.Picture)
        elif (filename.endswith("mov") or filename.endswith("mp4")):
            return File(filename=filename, category=Category.Video)
        return File(filename=filename, category=Category.Text)

    all_files = os.listdir(settings.content_directory)
    all_files = filter(_is_valid, all_files)
    all_files = map(_categorize, all_files)

    return {
        "files": list(all_files)
    }

@app.get("/__debug")
def info():
    return {
        "nonce": data["nonce"],
        "content_directory": settings.content_directory,
        "content_base": "/static"
    }

