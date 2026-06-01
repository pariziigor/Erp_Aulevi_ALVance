# backend/src/api/products.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from src.core.database import get_db
from src.models.product import Product, CategoryEnum
from src.schemas.product import ProductCreate, ProductResponse

router = APIRouter(prefix="/products", tags=["Produtos / Catálogo"])

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_produto(payload: ProductCreate, db: Session = Depends(get_db)):
    """Cadastra um novo produto no catálogo. Evita códigos duplicados."""
    codigo_uppercase = payload.codigo.strip().upper()
    
    # Regra de negócio: Código de produto deve ser único
    produto_existente = db.query(Product).filter(Product.codigo == codigo_uppercase).first()
    if produto_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Já existe um produto cadastrado com o código '{codigo_uppercase}'."
        )
        
    novo_produto = Product(
        codigo=codigo_uppercase,
        descricao=payload.descricao,
        categoria=payload.categoria,
        unidade_medida=payload.unidade_medida,
        preco=payload.preco,
        is_active=True # Booleano nativo puro
    )
    
    db.add(novo_produto)
    db.commit()
    db.refresh(novo_produto)
    return novo_produto

@router.get("", response_model=List[ProductResponse])
def listar_todos_produtos(db: Session = Depends(get_db)):
    """Lista todos os produtos ativos do catálogo."""
    return db.query(Product).filter(Product.is_active == True).all()

@router.get("/categoria/{categoria}", response_model=List[ProductResponse])
def listar_produtos_por_categoria(categoria: CategoryEnum, db: Session = Depends(get_db)):
    """Filtra os produtos ativos por categoria (LSF, MM ou CHALE). Útil para o PDV do vendedor."""
    return db.query(Product).filter(
        Product.categoria == categoria,
        Product.is_active == True
    ).all()