# backend/src/schemas/user.py
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from uuid import UUID
from src.models.user import RoleEnum

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(..., min_length=6, description="Senha com no mínimo 6 caracteres")
    role: RoleEnum = RoleEnum.SELLER

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    role: RoleEnum
    is_active: bool
    must_change_password: bool
    password_reset_requested_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class UserUpdate(BaseModel):
    role: Optional[RoleEnum] = None
    is_active: Optional[bool] = None


class PasswordChange(BaseModel):
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=8, description="Senha pessoal com no minimo 8 caracteres")


class PasswordForgot(BaseModel):
    email: EmailStr


class PasswordResetByAdmin(BaseModel):
    temporary_password: str = Field(..., min_length=6, description="Senha temporaria definida pelo administrador")


class PasswordActionResponse(BaseModel):
    message: str
    user: Optional[UserResponse] = None
