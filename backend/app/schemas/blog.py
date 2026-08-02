from __future__ import annotations

from pydantic import BaseModel


class BlogPostCreate(BaseModel):
    title: str
    content: str | None = None
    is_public: bool = False
    visibility: str = 'private'


class BlogPostUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    is_public: bool | None = None
    visibility: str | None = None


class BlogPostOut(BaseModel):
    id: str
    title: str
    content: str | None = None
    is_public: bool = False
    visibility: str = 'private'
    user_id: str | None = None

    class Config:
        from_attributes = True
