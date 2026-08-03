from __future__ import annotations

from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import MoneyEntry, User
from app.schemas.money import MoneyEntryCreate, MoneyEntryUpdate
from app.utils.security import get_current_user

router = APIRouter()


@router.post('/money')
async def create_money_entry(
    payload: MoneyEntryCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    if payload.type not in {'INCOME', 'EXPENSE', 'CREDIT'}:
        raise HTTPException(status_code=400, detail='Invalid type')
    if payload.amount is None:
        raise HTTPException(status_code=400, detail='Amount is required')

    if payload.type == 'CREDIT':
        if payload.direction not in {'i_owe', 'they_owe'}:
            raise HTTPException(status_code=400, detail='direction must be "i_owe" or "they_owe" for CREDIT')
        if not payload.counterparty:
            raise HTTPException(status_code=400, detail='counterparty is required for CREDIT')
        if not payload.credit_status:
            payload.credit_status = 'active'
    elif payload.type in {'INCOME', 'EXPENSE'}:
        if not payload.category:
            raise HTTPException(status_code=400, detail='category is required for INCOME and EXPENSE')

    money_entry = MoneyEntry(
        user_id=user.id,
        type=payload.type,
        amount=float(payload.amount),
        category=payload.category,
        note=payload.note,
        counterparty=payload.counterparty,
        credit_status=payload.credit_status,
        direction=payload.direction,
        date=date.fromisoformat(payload.date),
    )
    session.add(money_entry)
    await session.commit()
    await session.refresh(money_entry)
    return {'id': str(money_entry.id), 'status': 'created'}


@router.get('/money')
async def list_money_entries(
    type: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    category: str | None = None,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    query = select(MoneyEntry).where(MoneyEntry.user_id == user.id)
    if type:
        query = query.where(MoneyEntry.type == type)
    if start_date:
        query = query.where(MoneyEntry.date >= date.fromisoformat(start_date))
    if end_date:
        query = query.where(MoneyEntry.date <= date.fromisoformat(end_date))
    if category:
        query = query.where(MoneyEntry.category == category)
    query = query.order_by(MoneyEntry.date.desc(), MoneyEntry.created_at.desc())

    result = await session.execute(query)
    entries = result.scalars().all()
    return [
        {
            'id': str(entry.id),
            'type': entry.type,
            'amount': float(entry.amount),
            'category': entry.category,
            'note': entry.note,
            'counterparty': entry.counterparty,
            'credit_status': entry.credit_status,
            'direction': entry.direction,
            'date': entry.date.isoformat(),
            'created_at': entry.created_at.isoformat(),
        }
        for entry in entries
    ]


@router.put('/money/{entry_id}')
async def update_money_entry(
    entry_id: str,
    payload: MoneyEntryUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(select(MoneyEntry).where(MoneyEntry.id == entry_id, MoneyEntry.user_id == user.id))
    entry = result.scalar_one_or_none()
    if entry is None:
        raise HTTPException(status_code=404, detail='Entry not found')

    if payload.type is not None:
        entry.type = payload.type
    if payload.amount is not None:
        entry.amount = float(payload.amount)
    if payload.category is not None:
        entry.category = payload.category
    if payload.note is not None:
        entry.note = payload.note
    if payload.counterparty is not None:
        entry.counterparty = payload.counterparty
    if payload.credit_status is not None:
        entry.credit_status = payload.credit_status
    if payload.direction is not None:
        entry.direction = payload.direction
    if payload.date is not None:
        entry.date = date.fromisoformat(payload.date)

    await session.commit()
    return {'success': True}


@router.delete('/money/{entry_id}')
async def delete_money_entry(
    entry_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(select(MoneyEntry).where(MoneyEntry.id == entry_id, MoneyEntry.user_id == user.id))
    entry = result.scalar_one_or_none()
    if entry is None:
        raise HTTPException(status_code=404, detail='Entry not found')
    await session.delete(entry)
    await session.commit()
    return {'success': True}


@router.get('/money/credits')
async def list_credit_entries(user: User = Depends(get_current_user), session: AsyncSession = Depends(get_db)):
    result = await session.execute(
        select(MoneyEntry)
        .where(MoneyEntry.user_id == user.id, MoneyEntry.type == 'CREDIT', MoneyEntry.credit_status == 'active')
        .order_by(MoneyEntry.date.desc())
    )
    entries = result.scalars().all()
    return [
        {
            'id': str(entry.id),
            'type': entry.type,
            'amount': float(entry.amount),
            'category': entry.category,
            'note': entry.note,
            'counterparty': entry.counterparty,
            'credit_status': entry.credit_status,
            'direction': entry.direction,
            'date': entry.date.isoformat(),
        }
        for entry in entries
    ]


@router.put('/money/credits/{entry_id}/paid')
async def mark_credit_paid(
    entry_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(select(MoneyEntry).where(MoneyEntry.id == entry_id, MoneyEntry.user_id == user.id, MoneyEntry.type == 'CREDIT'))
    entry = result.scalar_one_or_none()
    if entry is None:
        raise HTTPException(status_code=404, detail='Credit entry not found')
    entry.credit_status = 'paid'
    await session.commit()
    return {'success': True, 'id': str(entry.id), 'credit_status': entry.credit_status}

@router.get('/money/summary')
async def get_money_summary(
    year: int = Query(...),
    month: int | None = Query(None),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    query = select(
        extract('month', MoneyEntry.date).label('month'),
        func.sum(func.case((MoneyEntry.type == 'INCOME', MoneyEntry.amount), else_=0)).label('total_income'),
        func.sum(func.case((MoneyEntry.type == 'EXPENSE', MoneyEntry.amount), else_=0)).label('total_expense')
    ).where(
        MoneyEntry.user_id == user.id,
        MoneyEntry.type.in_(['INCOME', 'EXPENSE']),
        extract('year', MoneyEntry.date) == year
    ).group_by(extract('month', MoneyEntry.date))
    
    if month is not None:
        query = query.where(extract('month', MoneyEntry.date) == month)
        
    result = await session.execute(query)
    rows = result.all()
    
    if month is not None:
        if not rows:
            return {'total_income': 0.0, 'total_expense': 0.0}
        row = rows[0]
        return {'total_income': float(row.total_income or 0.0), 'total_expense': float(row.total_expense or 0.0)}
        
    summary = [{'month': m, 'total_income': 0.0, 'total_expense': 0.0} for m in range(1, 13)]
    for row in rows:
        m_idx = int(row.month) - 1
        if 0 <= m_idx < 12:
            summary[m_idx]['total_income'] = float(row.total_income or 0.0)
            summary[m_idx]['total_expense'] = float(row.total_expense or 0.0)
            
    return summary
