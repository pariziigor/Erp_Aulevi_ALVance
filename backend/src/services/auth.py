# backend/src/services/auth.py
from supabase import create_client, Client
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.core.config import settings

# Inicializa o cliente SDK do Supabase
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
supabase_admin: Client | None = None
if settings.SUPABASE_SERVICE_ROLE_KEY:
    supabase_admin = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
security = HTTPBearer()

class AuthService:
    @staticmethod
    def obter_cliente_admin() -> Client:
        if not supabase_admin:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="SUPABASE_SERVICE_ROLE_KEY nao configurada. A criacao de usuarios pelo painel ADM exige a chave service_role do Supabase.",
            )
        return supabase_admin

    @staticmethod
    def autenticar_usuario(email: str, password: str) -> dict:
        """Autentica o usuário direto no Supabase Auth."""
        try:
            # O Supabase valida o e-mail, descriptografa a senha e gera o JWT
            auth_response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            return auth_response
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="E-mail ou senha incorretos."
            )

    @staticmethod
    def alterar_senha(email: str, current_password: str, new_password: str) -> None:
        """Valida a senha atual e troca a senha do usuario no Supabase."""
        try:
            client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            client.auth.sign_in_with_password({
                "email": email,
                "password": current_password,
            })
            client.auth.update_user({"password": new_password})
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Senha atual incorreta ou falha ao atualizar a senha.",
            )

    @staticmethod
    def redefinir_senha_temporaria(email: str, temporary_password: str, supabase_user_id: str | None = None) -> str:
        """Redefine a senha no Supabase sem envio de e-mail e retorna o ID do usuario remoto."""
        admin_client = AuthService.obter_cliente_admin()
        remote_user_id = supabase_user_id or AuthService._buscar_supabase_user_id_por_email(email)
        try:
            admin_client.auth.admin.update_user_by_id(remote_user_id, {"password": temporary_password})
            return remote_user_id
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Nao foi possivel redefinir a senha temporaria na nuvem.",
            )

    @staticmethod
    def _buscar_supabase_user_id_por_email(email: str) -> str:
        admin_client = AuthService.obter_cliente_admin()
        page = 1
        per_page = 1000
        target_email = email.lower()

        while True:
            users_page = admin_client.auth.admin.list_users(page=page, per_page=per_page)
            users = list(getattr(users_page, "users", users_page) or [])

            for user in users:
                if str(getattr(user, "email", "")).lower() == target_email:
                    return str(getattr(user, "id"))

            if len(users) < per_page:
                break
            page += 1

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario nao encontrado no provedor de autenticacao.",
        )

    @staticmethod
    def obter_usuario_logado(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
        """Middleware para extrair e validar o usuário atual a partir do Token JWT."""
        token = credentials.credentials
        try:
            # Valida o token direto na API do Supabase Auth
            user_data = supabase.auth.get_user(token)
            return user_data.user
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido ou expirado. Faça login novamente."
            )
