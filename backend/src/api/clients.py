# backend/src/api/clients.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from src.core.database import get_db
from src.models.audit_log import AuditLog
from src.models.client import Client
from src.models.user import User
from src.schemas.client import ClientContactUpdate, ClientCreate, ClientResponse
from src.services.cnpj import CNPJService
from src.services.auth import AuthService

router = APIRouter(prefix="/clients", tags=["Clientes"])

@router.get("/cnpj/{cnpj}")
async def buscar_cnpj(cnpj: str):
    """Buca dados cadastrais de uma empresa automaticamente pelo CNPJ."""
    return await CNPJService.consultar_cnpj(cnpj)

@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_cliente(payload: ClientCreate, db: Session = Depends(get_db)):
    """Salva um novo cliente na base compartilhada do Supabase. Evita duplicidade de CNPJ."""
    # Garante CNPJ apenas com números para busca no banco
    cnpj_limpo = "".join(filter(str.isdigit, payload.cnpj))
    
    # Regra de negócio: Evitar duplicidade de CNPJ
    cliente_existente = db.query(Client).filter(Client.cnpj == cnpj_limpo).first()
    if cliente_existente:
        # Retorna o cliente existente diretamente para o vendedor vinculá-lo ao orçamento
        return cliente_existente

    # Cria a instância mapeada para o banco de dados
    novo_cliente = Client(
        cnpj=cnpj_limpo,
        razao_social=payload.razao_social,
        nome_fantasia=payload.nome_fantasia,
        situacao_cadastral=payload.situacao_cadastral,
        cnae=payload.cnae,
        cep=payload.cep,
        endereco=payload.endereco,
        numero=payload.numero,
        bairro=payload.bairro,
        cidade=payload.cidade,
        uf=payload.uf,
        contato_nome=payload.contato_nome,
        contato_email=payload.contato_email,
        contato_whatsapp=payload.contato_whatsapp,
        contato_telefone=payload.contato_telefone,
        is_active=True # Booleano nativo estrito
    )
    
    db.add(novo_cliente)
    db.commit()
    db.refresh(novo_cliente)
    return novo_cliente

@router.get("", response_model=List[ClientResponse])
def listar_clientes(db: Session = Depends(get_db)):
    """Retorna todos os clientes cadastrados na base compartilhada."""
    return db.query(Client).filter(Client.is_active == True).all()


@router.patch("/{client_id}/contact", response_model=ClientResponse)
def atualizar_contato_cliente(
    client_id: UUID,
    payload: ClientContactUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    """Atualiza apenas e-mail e telefones de contato. Cliente cadastrado nunca é removido por esta rota."""
    client = db.query(Client).filter(Client.id == client_id, Client.is_active == True).first()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado.")

    actor = db.query(User).filter(User.email == current_user.email, User.is_active == True).first()
    if not actor:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuário não autorizado.")

    allowed_fields = ("contato_email", "contato_whatsapp", "contato_telefone")
    changes = {}

    for field in allowed_fields:
        new_value = getattr(payload, field)
        if new_value is None:
            continue

        old_value = getattr(client, field)
        if old_value != new_value:
            changes[field] = {"old": old_value, "new": new_value}
            setattr(client, field, new_value)

    if not changes:
        return client

    log = AuditLog(
        user_id=actor.id,
        user_name=actor.name,
        user_email=actor.email,
        action="client_contact_updated",
        entity_type="client",
        entity_id=str(client.id),
        entity_label=client.razao_social,
        changes=changes,
    )
    db.add(log)
    db.commit()
    db.refresh(client)
    return client
