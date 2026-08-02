from __future__ import annotations

from pydantic import BaseModel, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    user: dict | None = None


class UserOut(BaseModel):
    id: str
    email: str
    display_name: str
    avatar_url: str | None = None
    google_id: str

    class Config:
        from_attributes = True
