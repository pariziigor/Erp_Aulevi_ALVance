from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.models.audit_log import AuditLog
from src.models.user import RoleEnum, User
from src.schemas.audit_log import AuditLogResponse
from src.services.auth import AuthService

router = APIRouter(prefix="/audit-logs", tags=["Auditoria"])


def _get_admin_user(db: Session, current_user) -> User:
    user = db.query(User).filter(User.email == current_user.email, User.is_active == True).first()
    if not user or user.role != RoleEnum.ADM:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem consultar os logs.",
        )
    return user


@router.get("", response_model=List[AuditLogResponse])
def listar_logs_auditoria(
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    _get_admin_user(db, current_user)
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
