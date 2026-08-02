from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import BlogPost, Image, User
from app.schemas.blog import BlogPostCreate, BlogPostUpdate
from app.utils.security import get_current_user
from app.utils.uploads import delete_upload, save_upload

router = APIRouter()


@router.post('/blog')
async def create_blog_post(
    payload: BlogPostCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail='Title is required')
    post = BlogPost(
        user_id=user.id,
        title=payload.title,
        content=payload.content,
        is_public=payload.is_public,
        visibility='public' if payload.is_public else 'private',
    )
    session.add(post)
    await session.commit()
    await session.refresh(post)
    return {'id': str(post.id), 'title': post.title}


@router.get('/blog')
async def list_blog_posts(user: User = Depends(get_current_user), session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(BlogPost).where(BlogPost.user_id == user.id).order_by(BlogPost.created_at.desc()))
    posts = result.scalars().all()
    return [
        {
            'id': str(post.id),
            'user_id': str(post.user_id),
            'title': post.title,
            'content': post.content,
            'is_public': post.is_public,
            'visibility': post.visibility,
            'created_at': post.created_at.isoformat(),
            'updated_at': post.updated_at.isoformat(),
        }
        for post in posts
    ]


@router.put('/blog/{post_id}')
async def update_blog_post(
    post_id: str,
    payload: BlogPostUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(select(BlogPost).where(BlogPost.id == post_id, BlogPost.user_id == user.id))
    post = result.scalar_one_or_none()
    if post is None:
        raise HTTPException(status_code=404, detail='Post not found')

    if payload.title is not None:
        post.title = payload.title
    if payload.content is not None:
        post.content = payload.content
    if payload.is_public is not None:
        post.is_public = payload.is_public
        post.visibility = 'public' if payload.is_public else 'private'
    if payload.visibility is not None:
        post.visibility = payload.visibility
        post.is_public = payload.visibility == 'public'

    await session.commit()
    return {'success': True}


@router.delete('/blog/{post_id}')
async def delete_blog_post(
    post_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(select(BlogPost).where(BlogPost.id == post_id, BlogPost.user_id == user.id))
    post = result.scalar_one_or_none()
    if post is None:
        raise HTTPException(status_code=404, detail='Post not found')

    images_result = await session.execute(select(Image).where(Image.user_id == user.id, Image.entity_type == 'blog_post', Image.entity_id == post.id))
    for image in images_result.scalars().all():
        delete_upload(image.url)
        await session.delete(image)

    await session.delete(post)
    await session.commit()
    return {'success': True}


@router.post('/blog/{post_id}/images')
async def upload_blog_images(
    post_id: str,
    files: list[UploadFile] = File(...),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(select(BlogPost).where(BlogPost.id == post_id, BlogPost.user_id == user.id))
    post = result.scalar_one_or_none()
    if post is None:
        raise HTTPException(status_code=404, detail='Post not found')

    created = []
    for idx, file in enumerate(files):
        if not file.filename:
            continue
        url = save_upload(file, prefix='blog_post')
        image = Image(
            user_id=user.id,
            url=url,
            alt_text=file.filename,
            entity_type='blog_post',
            entity_id=post.id,
            order_index=idx,
        )
        session.add(image)
        await session.flush()
        created.append({'id': str(image.id), 'url': image.url, 'alt_text': image.alt_text})
    await session.commit()
    return {'images': created}


@router.delete('/blog/images/{image_id}')
async def delete_blog_image(
    image_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(select(Image).where(Image.id == image_id, Image.user_id == user.id, Image.entity_type == 'blog_post'))
    image = result.scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=404, detail='Image not found')
    delete_upload(image.url)
    await session.delete(image)
    await session.commit()
    return {'success': True}
