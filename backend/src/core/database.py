# backend/src/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from src.core.config import settings

# A engine é a ponte de comunicação com o PostgreSQL
engine = create_engine(settings.DATABASE_URL, echo=False)

# Sessão configurada para não comitar automaticamente (mais seguro para transações)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os nossos modelos herdarem
Base = declarative_base()

# Dependência do FastAPI para injetar a sessão do banco nas rotas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()