from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    title: str
    description: str | None = None
    github_url: str | None = None
    deployed_url: str | None = None
    tech_stack: list[str] | None = None
    is_featured: bool = False
    order_index: int = 0


class ProjectUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    github_url: str | None = None
    deployed_url: str | None = None
    tech_stack: list[str] | None = None
    is_featured: bool | None = None
    order_index: int | None = None


class ProjectOut(BaseModel):
    id: str
    title: str
    description: str | None = None
    github_url: str | None = None
    deployed_url: str | None = None
    tech_stack: list[str] | None = None
    is_featured: bool = False
    order_index: int = 0
    cover_image_id: str | None = None
    portfolio_id: str | None = None
    user_id: str | None = None

    class Config:
        from_attributes = True
