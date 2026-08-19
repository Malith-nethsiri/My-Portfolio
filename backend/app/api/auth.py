from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.schemas.user import AccountDeleteResponse, AuthTokenResponse, EmailChangeRequest, PasswordChangeRequest, UserCreate, UserLogin
from app.utils.security import create_access_token, get_current_user, get_password_hash, verify_password
from app.api.portfolio import get_or_create_portfolio

router = APIRouter()


@router.post('/signup', status_code=status.HTTP_201_CREATED)
async def signup(payload: UserCreate, session: AsyncSession = Depends(get_db)):
    # 1. Check if user exists
    existing_user = await session.scalar(select(User).where(User.email == payload.email))
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Email already registered')

    # 2. Create the User
    user = User(
        email=payload.email,
        display_name=payload.email.split('@')[0],
        hashed_password=get_password_hash(payload.password),
        email_verified=True,
        is_active=True,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)  # Ensure user.id is available

    # _ means a throw away variable, we don't need the portfolio object here, just ensuring it's created.
    _ = await get_or_create_portfolio(session, user)

    # The portfolio is now created and saved in the database.
    return {'message': 'Account created'}

@router.post('/login', response_model=AuthTokenResponse)
async def login(payload: UserLogin, session: AsyncSession = Depends(get_db)):
    user = await session.scalar(select(User).where(User.email == payload.email))
    if user is None or user.hashed_password is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')

    access_token = create_access_token(str(user.id))
    return {'access_token': access_token, 'token_type': 'bearer'}


@router.post('/change-password')
async def change_password(
    payload: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    if current_user.hashed_password is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Password account required')
    if not verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid password')

    current_user.hashed_password = get_password_hash(payload.new_password)
    await session.commit()
    return {'message': 'Password updated'}


@router.put('/change-email')
async def change_email(
    payload: EmailChangeRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    if current_user.hashed_password is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Password account required')
    if not verify_password(payload.password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid password')

    existing_user = await session.scalar(select(User).where(User.email == payload.new_email))
    if existing_user is not None and str(existing_user.id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Email already in use')

    current_user.email = payload.new_email
    current_user.email_verified = True
    await session.commit()
    return {'message': 'Email updated', 'new_email': current_user.email}


@router.get('/me')
async def get_me(current_user: User = Depends(get_current_user)) -> dict[str, str | None]:
    return {
        'id': str(current_user.id),
        'email': current_user.email,
        'display_name': current_user.display_name,
        'avatar_url': current_user.avatar_url,
        'created_at': current_user.created_at.isoformat(),
    }


@router.delete('/account', response_model=AccountDeleteResponse)
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
    return {'message': 'Account deleted'}
