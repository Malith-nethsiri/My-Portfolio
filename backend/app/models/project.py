from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import String, Text, Boolean, Integer, DateTime, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Project(Base):
    __tablename__ = 'projects'

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('portfolios.id'), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    cover_image_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey('images.id'), nullable=True)
    github_url: Mapped[str | None] = mapped_column(String, nullable=True)
    deployed_url: Mapped[str | None] = mapped_column(String, nullable=True)
    tech_stack: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    portfolio: Mapped['Portfolio'] = relationship(back_populates='projects')
    user: Mapped['User'] = relationship(back_populates='projects')
    cover_image: Mapped['Image | None'] = relationship()
