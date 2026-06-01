from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional
from uuid import UUID
from datetime import datetime

# Esquema base com os campos comuns
class ClientBase(BaseModel):
    cnpj: str = Field(..., description="CNPJ apenas com números ou formatado")
    razao_social: str
    nome_fantasia: Optional[str] = None
    situacao_cadastral: Optional[str] = None
    cnae: Optional[str] = None
    
    cep: Optional[str] = None
    endereco: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None
    
    contato_nome: str
    contato_email: EmailStr
    contato_whatsapp: str
    contato_telefone: Optional[str] = None
    is_active: bool = True

# Esquema usado para CRIAR um cliente (herda tudo do base)
class ClientCreate(ClientBase):
    pass


class ClientContactUpdate(BaseModel):
    contato_email: Optional[EmailStr] = None
    contato_whatsapp: Optional[str] = None
    contato_telefone: Optional[str] = None

    @model_validator(mode="after")
    def validate_at_least_one_field(self):
        if (
            self.contato_email is None
            and self.contato_whatsapp is None
            and self.contato_telefone is None
        ):
            raise ValueError("Informe pelo menos um contato para atualizar.")
        return self

# Esquema usado para DEVOLVER os dados (Out/Response)
class ClientResponse(ClientBase):
    id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True # Permite que o Pydantic leia modelos do SQLAlchemy
