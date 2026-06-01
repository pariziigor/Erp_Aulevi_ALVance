# backend/src/models/user.py
import uuid
from sqlalchemy import Column, String, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
from src.core.database import Base
import enum

class RoleEnum(str, enum.Enum):
    ADM = "ADM"
    SELLER = "SELLER"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.SELLER, nullable=False)
    
    # Tratando variável booleana como tipo nativo estrito
    is_active = Column(Boolean, default=True, nullable=False)