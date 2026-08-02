from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = 'users'

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    google_id: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    portfolio: Mapped['Portfolio | None'] = relationship(back_populates='user', uselist=False)
    projects: Mapped[list['Project']] = relationship(back_populates='user', cascade='all, delete-orphan')
    posts: Mapped[list['BlogPost']] = relationship(back_populates='user', cascade='all, delete-orphan')
    money_entries: Mapped[list['MoneyEntry']] = relationship(back_populates='user', cascade='all, delete-orphan')
    images: Mapped[list['Image']] = relationship(back_populates='user', cascade='all, delete-orphan')
