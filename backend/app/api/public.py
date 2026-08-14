from __future__ import annotations

from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal
from app.models import BlogPost, Image, Portfolio, Project, User

router = APIRouter()


@router.get('/portfolio/{username}')
async def public_portfolio(username: str) :
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == username))
        user = result.scalar_one_or_none()
        if user is None:
            result = await session.execute(select(User).where(User.display_name == username))
            user = result.scalar_one_or_none()
        if user is None:
            raise HTTPException(status_code=404, detail='User not found')

        portfolio_result = await session.execute(select(Portfolio).where(Portfolio.user_id == user.id))
        portfolio = portfolio_result.scalar_one_or_none()
        if portfolio is None:
            raise HTTPException(status_code=404, detail='Portfolio not found')

        gallery = await session.execute(
            select(Image)
            .where(Image.user_id == user.id, Image.entity_type == 'portfolio_gallery')
            .order_by(Image.order_index.asc())
        )
        gallery_images = [
            {'id': str(img.id), 'url': img.url, 'alt_text': img.alt_text, 'order_index': img.order_index}
            for img in gallery.scalars().all()
        ]

        project_result = await session.execute(
            select(Project)
            .where(Project.user_id == user.id, Project.is_featured.is_(True))
            .order_by(Project.order_index.asc())
        )
        featured_projects = [
            {
                'id': str(project.id),
                'title': project.title,
                'description': project.description,
                'github_url': project.github_url,
                'deployed_url': project.deployed_url,
                'tech_stack': project.tech_stack,
                'cover_image_id': str(project.cover_image_id) if project.cover_image_id else None,
            }
            for project in project_result.scalars().all()
        ]

        sections_result = await session.execute(
            select(Image).where(Image.user_id == user.id, Image.entity_type == 'portfolio_gallery')
        )
        sections = [
            {'section_type': section.section_type, 'visible': section.visible, 'order_index': section.order_index}
            for section in portfolio.sections
        ]

        return {
            'user': {
                'id': str(user.id),
                'display_name': user.display_name,
                'email': user.email,
                'avatar_url': user.avatar_url,
            },
            'bio': portfolio.bio,
            'skills': portfolio.skills,
            'design_settings': portfolio.design_settings,
            'social_links': portfolio.social_links,
            'sections': sections,
            'gallery': gallery_images,
            'featured_projects': featured_projects,
            'contact': {'email': user.email},
        }


@router.get('/projects/{username}')
async def public_projects(username: str):
    async with AsyncSessionLocal() as session:
        user = await get_user_by_username(session, username)
        result = await session.execute(
            select(Project)
            .where(Project.user_id == user.id)
            .order_by(Project.order_index.asc(), Project.created_at.desc())
        )
        return [
            {
                'id': str(project.id),
                'title': project.title,
                'description': project.description,
                'github_url': project.github_url,
                'deployed_url': project.deployed_url,
                'tech_stack': project.tech_stack,
                'is_featured': project.is_featured,
                'cover_image_id': str(project.cover_image_id) if project.cover_image_id else None,
            }
            for project in result.scalars().all()
        ]


@router.get('/blog/{username}')
async def public_blog(username: str):
    async with AsyncSessionLocal() as session:
        user = await get_user_by_username(session, username)
        result = await session.execute(
            select(BlogPost)
            .where(BlogPost.user_id == user.id, BlogPost.visibility == 'public')
            .order_by(BlogPost.created_at.desc())
        )
        posts = result.scalars().all()
        return [
            {
                'id': str(post.id),
                'title': post.title,
                'content': post.content,
                'created_at': post.created_at.isoformat(),
                'images': await get_images_for_post(session, post.id),
            }
            for post in posts
        ]


@router.get('/blog/{username}/{post_id}')
async def public_blog_post(username: str, post_id: str):
    async with AsyncSessionLocal() as session:
        user = await get_user_by_username(session, username)
        result = await session.execute(select(BlogPost).where(BlogPost.id == post_id, BlogPost.user_id == user.id, BlogPost.visibility == 'public'))
        post = result.scalar_one_or_none()
        if post is None:
            raise HTTPException(status_code=404, detail='Blog post not found')
        return {
            'id': str(post.id),
            'title': post.title,
            'content': post.content,
            'created_at': post.created_at.isoformat(),
            'images': await get_images_for_post(session, post.id),
        }


async def get_user_by_username(session: AsyncSession, username: str):
    result = await session.execute(select(User).where(User.email == username))
    user = result.scalar_one_or_none()
    if user is None:
        result = await session.execute(select(User).where(User.display_name == username))
        user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    return user


async def get_images_for_post(session: AsyncSession, post_id):
    result = await session.execute(select(Image).where(Image.entity_type == 'blog_post', Image.entity_id == post_id).order_by(Image.order_index.asc()))
    return [{
        'id': str(image.id),
        'url': image.url,
        'alt_text': image.alt_text,
        'order_index': image.order_index,
    } for image in result.scalars().all()]
