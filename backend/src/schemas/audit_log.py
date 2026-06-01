from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    action: str
    entity_type: str
    entity_id: str
    entity_label: Optional[str] = None
    changes: Optional[dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True
