from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel, Field


class MoneyEntryCreate(BaseModel):
    type: str
    amount: Decimal
    category: str | None = None
    note: str | None = None
    counterparty: str | None = None
    credit_status: str | None = None
    direction: str | None = None
    date: str


class MoneyEntryUpdate(BaseModel):
    type: str | None = None
    amount: Decimal | None = None
    category: str | None = None
    note: str | None = None
    counterparty: str | None = None
    credit_status: str | None = None
    direction: str | None = None
    date: str | None = None


class MoneyEntryOut(BaseModel):
    id: str
    type: str
    amount: Decimal
    category: str | None = None
    note: str | None = None
    counterparty: str | None = None
    credit_status: str | None = None
    direction: str | None = None
    date: str

    class Config:
        from_attributes = True


class CreditPaidResponse(BaseModel):
    id: str
    credit_status: str
