from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Image, Portfolio, Project, User
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.utils.security import get_current_user
from app.utils.uploads import delete_upload, save_upload

router = APIRouter()


async def ensure_portfolio(session: AsyncSession, user: User) -> Portfolio:
    result = await session.execute(select(Portfolio).where(Portfolio.user_id == user.id))
    portfolio = result.scalar_one_or_none()
    if portfolio is None:
        from app.api.portfolio import get_or_create_portfolio
        portfolio = await get_or_create_portfolio(session, user)
    return portfolio


@router.post('/projects')
async def create_project(
    payload: ProjectCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail='Title is required')
    portfolio = await ensure_portfolio(session, user)
    project = Project(
        portfolio_id=portfolio.id,
        user_id=user.id,
        title=payload.title,
        description=payload.description,
        github_url=payload.github_url,
        deployed_url=payload.deployed_url,
        tech_stack=payload.tech_stack,
        is_featured=payload.is_featured,
        order_index=payload.order_index,
    )
    session.add(project)
    await session.commit()
    await session.refresh(project)
    return {'id': str(project.id), 'title': project.title}


@router.put('/projects/{project_id}')
async def update_project(
    project_id: str,
    payload: ProjectUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(select(Project).where(Project.id == project_id, Project.user_id == user.id))
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=404, detail='Project not found')

    for field in ['title', 'description', 'github_url', 'deployed_url', 'tech_stack', 'is_featured', 'order_index']:
        value = getattr(payload, field)
        if value is not None:
            setattr(project, field, value)
    await session.commit()
    return {'success': True}


@router.delete('/projects/{project_id}')
async def delete_project(
    project_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(select(Project).where(Project.id == project_id, Project.user_id == user.id))
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=404, detail='Project not found')

    if project.cover_image_id:
        cover_image_result = await session.execute(select(Image).where(Image.id == project.cover_image_id, Image.user_id == user.id))
        cover_image = cover_image_result.scalar_one_or_none()
        if cover_image:
            delete_upload(cover_image.url)
            await session.delete(cover_image)

    await session.delete(project)
    await session.commit()
    return {'success': True}


@router.get('/projects')
async def list_projects(user: User = Depends(get_current_user), session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(Project).where(Project.user_id == user.id).order_by(Project.order_index.asc(), Project.created_at.asc()))
    projects = result.scalars().all()
    return [
        {
            'id': str(project.id),
            'portfolio_id': str(project.portfolio_id),
            'user_id': str(project.user_id),
            'title': project.title,
            'description': project.description,
            'cover_image_id': str(project.cover_image_id) if project.cover_image_id else None,
            'github_url': project.github_url,
            'deployed_url': project.deployed_url,
            'tech_stack': project.tech_stack,
            'is_featured': project.is_featured,
            'order_index': project.order_index,
            'created_at': project.created_at.isoformat(),
            'updated_at': project.updated_at.isoformat(),
        }
        for project in projects
    ]


@router.post('/projects/{project_id}/cover')
async def upload_project_cover(
    project_id: str,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(select(Project).where(Project.id == project_id, Project.user_id == user.id))
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=404, detail='Project not found')
    if not file.filename:
        raise HTTPException(status_code=400, detail='Invalid file upload')

    url = save_upload(file, prefix='project_cover')
    image = Image(
        user_id=user.id,
        url=url,
        alt_text=file.filename,
        entity_type='project_cover',
        entity_id=project.id,
        order_index=0,
    )
    session.add(image)
    await session.flush()

    if project.cover_image_id:
        existing = await session.get(Image, project.cover_image_id)
        if existing and existing.user_id == user.id:
            delete_upload(existing.url)
            await session.delete(existing)

    project.cover_image_id = image.id
    await session.commit()
    return {'success': True, 'image': {'id': str(image.id), 'url': image.url}}


@router.delete('/projects/{project_id}/cover')
async def delete_project_cover(
    project_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(select(Project).where(Project.id == project_id, Project.user_id == user.id))
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=404, detail='Project not found')

    if project.cover_image_id:
        cover_image = await session.get(Image, project.cover_image_id)
        if cover_image:
            delete_upload(cover_image.url)
            await session.delete(cover_image)
        project.cover_image_id = None
        await session.commit()
    return {'success': True}
