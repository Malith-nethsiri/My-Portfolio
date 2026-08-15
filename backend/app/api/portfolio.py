from __future__ import annotations

import json
import re
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Image, Portfolio, Section, User
from app.schemas.portfolio import GalleryUploadResponse, PortfolioUpdate, SectionUpdate
from app.utils.security import get_current_user
from app.utils.uploads import delete_upload, save_upload

router = APIRouter()


async def get_or_create_portfolio(session: AsyncSession, user: User) -> Portfolio:
    result = await session.execute(select(Portfolio).where(Portfolio.user_id == user.id).options(selectinload(Portfolio.sections)))
    portfolio = result.scalar_one_or_none()
    if portfolio is not None:
        return portfolio

    portfolio = Portfolio(user_id=user.id)
    session.add(portfolio)
    await session.commit()
    await session.refresh(portfolio)

    default_sections = [
        ('hero', True, 0),
        ('about', True, 1),
        ('skills', True, 2),
        ('featured_projects', True, 3),
        ('gallery', True, 4),
        ('contact', True, 5),
    ]
    for section_type, visible, order_index in default_sections:
        session.add(Section(portfolio_id=portfolio.id, section_type=section_type, visible=visible, order_index=order_index))
    await session.commit()
    await session.refresh(portfolio)
    return portfolio


@router.get('/portfolio')
async def get_my_portfolio(user: User = Depends(get_current_user), session: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    portfolio = await get_or_create_portfolio(session, user)
    sections = sorted(portfolio.sections, key=lambda item: item.order_index)
    return {
        'id': str(portfolio.id),
        'user_id': str(portfolio.user_id),
        'bio': portfolio.bio,
        'skills': portfolio.skills,
        'design_settings': portfolio.design_settings,
        'social_links': portfolio.social_links,
        'sections': [
            {
                'id': str(section.id),
                'section_type': section.section_type,
                'visible': section.visible,
                'order_index': section.order_index,
            }
            for section in sections
        ],
        'created_at': portfolio.created_at.isoformat() if portfolio.created_at else None,
        'updated_at': portfolio.updated_at.isoformat() if portfolio.updated_at else None,
    }


@router.put('/portfolio')
async def update_portfolio(
    payload: PortfolioUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    portfolio = await get_or_create_portfolio(session, user)
    if payload.bio is not None:
        portfolio.bio = payload.bio
    if payload.skills is not None:
        portfolio.skills = payload.skills
    if payload.design_settings is not None:
        portfolio.design_settings = payload.design_settings
    if payload.social_links is not None:
        portfolio.social_links = payload.social_links

    await session.commit()
    await session.refresh(portfolio)
    return {'success': True, 'portfolio': await get_my_portfolio(user=user, session=session)}


@router.put('/portfolio/sections')
async def update_portfolio_sections(
    sections: list[SectionUpdate],
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    portfolio = await get_or_create_portfolio(session, user)
    existing = {section.section_type: section for section in portfolio.sections}

    for section_data in sections:
        section = existing.get(section_data.section_type)
        if section is None:
            section = Section(
                portfolio_id=portfolio.id,
                section_type=section_data.section_type,
                visible=section_data.visible,
                order_index=section_data.order_index,
            )
            session.add(section)
        else:
            section.visible = section_data.visible
            section.order_index = section_data.order_index

    await session.commit()
    return {'success': True}


@router.post('/portfolio/gallery/upload')
async def upload_portfolio_gallery(
    files: list[UploadFile] = File(...),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    portfolio = await get_or_create_portfolio(session, user)
    if len(files) > 20:
        raise HTTPException(status_code=400, detail='Maximum 20 images allowed')

    created = []
    for idx, file in enumerate(files):
        if not file.filename:
            continue
        url = save_upload(file, prefix='portfolio_gallery')
        image = Image(
            user_id=user.id,
            url=url,
            alt_text=file.filename,
            entity_type='portfolio_gallery',
            entity_id=portfolio.id,
            order_index=idx,
        )
        session.add(image)
        await session.flush()
        created.append({
            'id': str(image.id),
            'url': image.url,
            'alt_text': image.alt_text,
            'entity_type': image.entity_type,
            'entity_id': str(image.entity_id) if image.entity_id else None,
            'order_index': image.order_index,
        })

    await session.commit()
    return {'images': created}


@router.delete('/portfolio/gallery/{image_id}')
async def delete_portfolio_gallery_image(
    image_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(select(Image).where(Image.id == image_id, Image.user_id == user.id))
    image = result.scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=404, detail='Image not found')

    delete_upload(image.url)
    await session.delete(image)
    await session.commit()
    return {'success': True}


@router.put('/portfolio/gallery/reorder')
async def reorder_portfolio_gallery(
    image_ids: list[str],
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    for index, image_id in enumerate(image_ids):
        result = await session.execute(select(Image).where(Image.id == image_id, Image.user_id == user.id, Image.entity_type == 'portfolio_gallery'))
        image = result.scalar_one_or_none()
        if image is not None:
            image.order_index = index
    await session.commit()
    return {'success': True}
