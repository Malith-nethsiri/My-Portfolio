from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.portfolio import Portfolio
from app.models.project import Project
from app.models.blog import BlogPost
from app.models.money import MoneyEntry


class User(Base):
    __tablename__ = 'users'

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    google_id: Mapped[str | None] = mapped_column(String, unique=True, nullable=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
    hashed_password: Mapped[str | None] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    email_verified: Mapped[bool] = mapped_column(default=True, nullable=False)
    verification_token: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    portfolio: Mapped['Portfolio | None'] = relationship('Portfolio', back_populates='user', uselist=False, lazy="selectin")
    projects: Mapped[list['Project']] = relationship('Project', back_populates='user', cascade='all, delete-orphan', lazy="selectin")
    posts: Mapped[list['BlogPost']] = relationship('BlogPost', back_populates='user', cascade='all, delete-orphan', lazy="selectin")
    money_entries: Mapped[list['MoneyEntry']] = relationship('MoneyEntry', back_populates='user', cascade='all, delete-orphan', lazy="selectin")
    images: Mapped[list['Image']] = relationship('Image', back_populates='user', cascade='all, delete-orphan', lazy="selectin")
