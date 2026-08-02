from __future__ import annotations

import re

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

PASSWORD_REGEX = re.compile(r'^(?=.*[A-Za-z])(?=.*\d).{8,}$')


class UserCreate(BaseModel):
    email: EmailStr
    password: str

    @field_validator('password')
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not PASSWORD_REGEX.match(value):
            raise ValueError('Password must be at least 8 characters and include at least one letter and one digit')
        return value


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not PASSWORD_REGEX.match(value):
            raise ValueError('Password must be at least 8 characters and include at least one letter and one digit')
        return value


class EmailChangeRequest(BaseModel):
    new_email: EmailStr
    password: str


class AccountDeleteResponse(BaseModel):
    message: str


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    model_config = ConfigDict(from_attributes=True)
