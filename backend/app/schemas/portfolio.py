from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class PortfolioUpdate(BaseModel):
    bio: str | None = None
    skills: str | None = None
    design_settings: dict[str, Any] | None = None
    social_links: dict[str, Any] | None = None
    role: str | None = None


class SectionUpdate(BaseModel):
    section_type: str
    visible: bool = True
    order_index: int = 0


class ImageOut(BaseModel):
    id: str
    url: str
    alt_text: str | None = None
    entity_type: str | None = None
    entity_id: str | None = None
    order_index: int = 0

    class Config:
        from_attributes = True


class PortfolioOut(BaseModel):
    id: str
    bio: str | None = None
    skills: str | None = None
    design_settings: dict[str, Any] | None = None
    social_links: dict[str, Any] | None = None
    user_id: str | None = None
    created_at: str | None = None
    updated_at: str | None = None


class GalleryUploadResponse(BaseModel):
    image: ImageOut
