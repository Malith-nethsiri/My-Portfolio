from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import AsyncSessionLocal, get_db
from app.models import User
from app.utils.security import create_access_token, get_current_user

router = APIRouter()

try:
    from authlib.integrations.starlette_client import OAuth

    oauth = OAuth()
    oauth.register(
        name='google',
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={'scope': 'openid email profile'},
    )
except Exception:
    oauth = None


@router.get('/auth/google/login')
async def google_login():
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=400, detail='Google OAuth credentials not configured')
    if oauth is None:
        raise HTTPException(status_code=500, detail='OAuth client unavailable')

    authorization_url, state = oauth.google.create_authorization_url(settings.GOOGLE_REDIRECT_URI)
    return {'authorization_url': authorization_url, 'state': state}


@router.get('/auth/google/callback')
async def google_callback(request: Request):
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=400, detail='Google OAuth credentials not configured')
    if oauth is None:
        raise HTTPException(status_code=500, detail='OAuth client unavailable')

    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as exc:
        raise HTTPException(status_code=400, detail='Failed to exchange Google token') from exc

    user_info = token.get('userinfo')
    if not user_info:
        try:
            user_info = await oauth.google.userinfo(token=token)
        except Exception as exc:
            raise HTTPException(status_code=400, detail='Unable to fetch Google profile') from exc

    google_id = user_info.get('sub')
    email = user_info.get('email')
    if not google_id or not email:
        raise HTTPException(status_code=400, detail='Google user profile missing required info')

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.google_id == google_id))
        user = result.scalar_one_or_none()

        if user is None:
            result_email = await session.execute(select(User).where(User.email == email))
            existing_email_user = result_email.scalar_one_or_none()
            if existing_email_user is not None:
                existing_email_user.google_id = google_id
                existing_email_user.avatar_url = user_info.get('picture')
                existing_email_user.display_name = user_info.get('name') or existing_email_user.display_name
                user = existing_email_user
            else:
                user = User(
                    google_id=google_id,
                    email=email,
                    display_name=user_info.get('name') or email.split('@')[0],
                    avatar_url=user_info.get('picture'),
                )
                session.add(user)

        else:
            user.email = email
            user.display_name = user_info.get('name') or user.display_name
            user.avatar_url = user_info.get('picture') or user.avatar_url

        await session.commit()
        await session.refresh(user)

    access_token = create_access_token(str(user.id))
    return {
        'access_token': access_token,
        'token_type': 'bearer',
        'user': {
            'id': str(user.id),
            'email': user.email,
            'display_name': user.display_name,
            'avatar_url': user.avatar_url,
            'google_id': user.google_id,
        },
    }


@router.get('/me')
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        'id': str(current_user.id),
        'email': current_user.email,
        'display_name': current_user.display_name,
        'avatar_url': current_user.avatar_url,
        'google_id': current_user.google_id,
        'created_at': current_user.created_at.isoformat(),
    }


@router.delete('/account')
async def delete_account(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    from app.models import BlogPost, Image, MoneyEntry, Portfolio, Project, Section

    for model in [Section, Project, BlogPost, MoneyEntry, Image, Portfolio]:
        rows = await session.execute(select(model))
        for row in rows.scalars().all():
            if hasattr(row, 'user_id') and row.user_id == current_user.id:
                await session.delete(row)
            elif hasattr(row, 'portfolio_id'):
                portfolio = await session.get(Portfolio, row.portfolio_id)
                if portfolio and portfolio.user_id == current_user.id:
                    await session.delete(row)

    await session.delete(current_user)
    await session.commit()
    return {'success': True, 'message': 'Account deleted'}
