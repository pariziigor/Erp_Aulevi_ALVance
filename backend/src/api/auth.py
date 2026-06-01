# backend/src/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.user import User, RoleEnum
from src.schemas.user import UserLogin, UserCreate, TokenResponse, UserResponse
from src.services.auth import AuthService
from passlib.context import CryptContext

router = APIRouter(prefix="/auth", tags=["Autenticação / IAM"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Realiza o login do usuário e retorna o token de acesso JWT."""
    # 1. Autentica na camada do Supabase Auth
    supabase_auth = AuthService.autenticar_usuario(payload.email, payload.password)
    
    # 2. Busca o perfil e as permissões do usuário no nosso banco local do ERP
    user_local = db.query(User).filter(User.email == payload.email).first()
    
    if not user_local or not user_local.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Este usuário está desativado no sistema comercial."
        )

    return {
        "access_token": supabase_auth.session.access_token,
        "token_type": "bearer",
        "user": user_local
    }

@router.post("/register-seller", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def criar_vendedor(payload: UserCreate, db: Session = Depends(get_db), current_user: dict = Depends(AuthService.obter_usuario_logado)):
    """Rota protegida: Cria um novo usuário vendedor no sistema (Apenas ADMs)."""
    # Verificação de segurança local: Busca se quem está chamando a rota é ADM
    admin_check = db.query(User).filter(User.email == current_user.email).first()
    if not admin_check or admin_check.role != RoleEnum.ADM:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem criar novos usuários."
        )

    # Verifica duplicidade
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

    try:
        # 1. Registra na tabela de Auth do Supabase
        from src.services.auth import supabase
        supabase.auth.admin.create_user({
            "email": payload.email,
            "password": payload.password,
            "email_confirm": True
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar credenciais na nuvem: {str(e)}")

    # 2. Salva o perfil comercial no nosso banco PostgreSQL
    novo_usuario = User(
        name=payload.name,
        email=payload.email,
        password_hash=pwd_context.hash(payload.password), # Criptografia redundante por segurança
        role=payload.role,
        is_active=True
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario