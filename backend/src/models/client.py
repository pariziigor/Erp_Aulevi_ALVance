# backend/src/models/client.py
import uuid
from sqlalchemy import Column, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
from src.core.database import Base

class Client(Base):
    __tablename__ = "clients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cnpj = Column(String, unique=True, index=True, nullable=False)
    razao_social = Column(String, nullable=False)
    nome_fantasia = Column(String)
    cnae = Column(String)
    
    cep = Column(String)
    endereco = Column(String)
    numero = Column(String)
    bairro = Column(String)
    cidade = Column(String)
    uf = Column(String)
    
    contato_nome = Column(String, nullable=False)
    contato_email = Column(String, nullable=False)
    contato_whatsapp = Column(String, nullable=False)
    
    is_active = Column(Boolean, default=True, nullable=False)