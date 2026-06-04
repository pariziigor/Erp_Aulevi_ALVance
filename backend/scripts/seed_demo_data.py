r"""Seed temporary demo data for local/system testing.

Usage from backend folder:
    .\venv\Scripts\python.exe scripts\seed_demo_data.py seed
    .\venv\Scripts\python.exe scripts\seed_demo_data.py cleanup
"""
from __future__ import annotations

import sys
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from pathlib import Path

from passlib.context import CryptContext

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from src.core.database import SessionLocal
from src.models.client import Client
from src.models.product import CategoryEnum, Product
from src.models.quote import Quote, QuoteItem, QuoteStatus
from src.models.user import RoleEnum, User


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
DEMO_PREFIX = "DEMO"


PRODUCTS = [
    ("DEMO-LSF-001", "Perfil guia steel frame 90mm", CategoryEnum.LSF, "UN", "31.90"),
    ("DEMO-LSF-002", "Montante steel frame 90mm", CategoryEnum.LSF, "UN", "42.50"),
    ("DEMO-LSF-003", "Placa cimenticia 1200x2400", CategoryEnum.LSF, "UN", "168.00"),
    ("DEMO-MM-001", "Viga metalica galvanizada", CategoryEnum.MM, "UN", "289.90"),
    ("DEMO-MM-002", "Parafuso estrutural metalico", CategoryEnum.MM, "CX", "118.75"),
    ("DEMO-MM-003", "Telha sanduiche termoacustica", CategoryEnum.MM, "M2", "152.40"),
    ("DEMO-CHALE-001", "Kit estrutura chale compacto", CategoryEnum.CHALE, "KIT", "9850.00"),
    ("DEMO-CHALE-002", "Fechamento externo chale", CategoryEnum.CHALE, "M2", "245.00"),
]

CLIENTS = [
    {
        "cnpj": "99000000000101",
        "razao_social": "DEMO CONSTRUTORA HORIZONTE LTDA",
        "nome_fantasia": "Demo Horizonte",
        "situacao_cadastral": "ATIVA",
        "cep": "01001000",
        "endereco": "Praca da Se",
        "numero": "100",
        "bairro": "Se",
        "cidade": "Sao Paulo",
        "uf": "SP",
        "contato_nome": "Marina Demo",
        "contato_email": "marina.demo@example.com",
        "contato_whatsapp": "11990000001",
        "contato_telefone": "1130000001",
    },
    {
        "cnpj": "99000000000102",
        "razao_social": "DEMO ENGENHARIA VALE AZUL SA",
        "nome_fantasia": "Vale Azul Demo",
        "situacao_cadastral": "ATIVA",
        "cep": "30140071",
        "endereco": "Avenida Afonso Pena",
        "numero": "2200",
        "bairro": "Funcionarios",
        "cidade": "Belo Horizonte",
        "uf": "MG",
        "contato_nome": "Rafael Demo",
        "contato_email": "rafael.demo@example.com",
        "contato_whatsapp": "31990000002",
        "contato_telefone": "3130000002",
    },
    {
        "cnpj": "99000000000103",
        "razao_social": "DEMO PROJETOS SERRA NORTE LTDA",
        "nome_fantasia": "Serra Norte Demo",
        "situacao_cadastral": "ATIVA",
        "cep": "80010000",
        "endereco": "Rua XV de Novembro",
        "numero": "450",
        "bairro": "Centro",
        "cidade": "Curitiba",
        "uf": "PR",
        "contato_nome": "Bianca Demo",
        "contato_email": "bianca.demo@example.com",
        "contato_whatsapp": "41990000003",
        "contato_telefone": "4130000003",
    },
]


def get_or_create_seller(db) -> User:
    seller = (
        db.query(User)
        .filter(User.is_active == True, User.role == RoleEnum.SELLER)
        .order_by(User.name.asc())
        .first()
    )
    if seller:
        return seller

    admin = (
        db.query(User)
        .filter(User.is_active == True, User.role == RoleEnum.ADM)
        .order_by(User.name.asc())
        .first()
    )
    if admin:
        return admin

    demo_user = db.query(User).filter(User.email == "demo.seller@aulevi.local").first()
    if demo_user:
        return demo_user

    demo_user = User(
        name="Demo Seller",
        email="demo.seller@aulevi.local",
        password_hash=pwd_context.hash("Demo1234"),
        role=RoleEnum.SELLER,
        is_active=True,
        must_change_password=False,
    )
    db.add(demo_user)
    db.flush()
    return demo_user


def seed_products(db) -> dict[str, Product]:
    products: dict[str, Product] = {}
    for codigo, descricao, categoria, unidade, preco in PRODUCTS:
        product = db.query(Product).filter(Product.codigo == codigo).first()
        if not product:
            product = Product(
                codigo=codigo,
                descricao=descricao,
                categoria=categoria,
                unidade_medida=unidade,
                preco=Decimal(preco),
                is_active=True,
            )
            db.add(product)
            db.flush()
        products[codigo] = product
    return products


def seed_clients(db) -> dict[str, Client]:
    clients: dict[str, Client] = {}
    for payload in CLIENTS:
        client = db.query(Client).filter(Client.cnpj == payload["cnpj"]).first()
        if not client:
            client = Client(**payload, is_active=True)
            db.add(client)
            db.flush()
        clients[payload["cnpj"]] = client
    return clients


def add_quote_items(db, quote: Quote, items: list[tuple[Product, Decimal]]) -> None:
    if quote.items:
        return

    subtotal = Decimal("0.00")
    for product, quantidade in items:
        total_item = quantidade * Decimal(product.preco)
        subtotal += total_item
        db.add(
            QuoteItem(
                quote_id=quote.id,
                product_id=product.id,
                quantidade=quantidade,
                preco_unitario=product.preco,
                total_item=total_item,
            )
        )

    quote.subtotal = subtotal
    quote.total = subtotal - Decimal(quote.desconto or 0) + Decimal(quote.valor_frete or 0)


def seed_quotes(db, seller: User, clients: dict[str, Client], products: dict[str, Product]) -> None:
    quote_specs = [
        {
            "numero": "DEMO-ORC-0001",
            "client": "99000000000101",
            "status": QuoteStatus.PENDENTE,
            "desconto": Decimal("250.00"),
            "frete": Decimal("480.00"),
            "payment": "BOLETO 30 DIAS",
            "shipping": "TRANSPORTADORA",
            "created_days": 8,
            "items": [("DEMO-LSF-001", Decimal("40")), ("DEMO-LSF-002", Decimal("35")), ("DEMO-LSF-003", Decimal("12"))],
        },
        {
            "numero": "DEMO-ORC-0002",
            "client": "99000000000102",
            "status": QuoteStatus.APROVADO,
            "desconto": Decimal("0.00"),
            "frete": Decimal("0.00"),
            "payment": "A VISTA",
            "shipping": "FRETE INCLUSO",
            "created_days": 5,
            "items": [("DEMO-MM-001", Decimal("10")), ("DEMO-MM-002", Decimal("6")), ("DEMO-MM-003", Decimal("90"))],
        },
        {
            "numero": "DEMO-ORC-0003",
            "client": "99000000000103",
            "status": QuoteStatus.CONVERTIDO_EM_PEDIDO,
            "desconto": Decimal("500.00"),
            "frete": Decimal("1250.00"),
            "payment": "ENTRADA + 2 PARCELAS",
            "shipping": "CIF",
            "created_days": 2,
            "items": [("DEMO-CHALE-001", Decimal("1")), ("DEMO-CHALE-002", Decimal("55"))],
        },
        {
            "numero": "DEMO-ORC-0004",
            "client": "99000000000101",
            "status": QuoteStatus.CANCELADO,
            "desconto": Decimal("0.00"),
            "frete": Decimal("350.00"),
            "payment": "CARTAO",
            "shipping": "RETIRADA",
            "created_days": 15,
            "items": [("DEMO-LSF-002", Decimal("18")), ("DEMO-MM-002", Decimal("2"))],
        },
    ]

    for spec in quote_specs:
        quote = db.query(Quote).filter(Quote.numero_orcamento == spec["numero"]).first()
        if not quote:
            created_at = datetime.now(UTC).replace(tzinfo=None) - timedelta(days=spec["created_days"])
            quote = Quote(
                numero_orcamento=spec["numero"],
                client_id=clients[spec["client"]].id,
                seller_id=seller.id,
                status=spec["status"],
                desconto=spec["desconto"],
                valor_frete=spec["frete"],
                payment_condition=spec["payment"],
                shipping_type=spec["shipping"],
                observations="Registro demo provisório para testes do sistema.",
                created_at=created_at,
                updated_at=created_at,
                sent_at=created_at if spec["status"] != QuoteStatus.RASCUNHO else None,
            )
            db.add(quote)
            db.flush()

        add_quote_items(
            db,
            quote,
            [(products[product_code], quantity) for product_code, quantity in spec["items"]],
        )


def seed() -> None:
    db = SessionLocal()
    try:
        seller = get_or_create_seller(db)
        products = seed_products(db)
        clients = seed_clients(db)
        seed_quotes(db, seller, clients, products)
        db.commit()
        print("Demo data seeded successfully.")
        print(f"Quotes assigned to: {seller.name} ({seller.email})")
    finally:
        db.close()


def cleanup() -> None:
    db = SessionLocal()
    try:
        demo_quotes = db.query(Quote).filter(Quote.numero_orcamento.like(f"{DEMO_PREFIX}-%")).all()
        demo_quote_ids = [quote.id for quote in demo_quotes]

        if demo_quote_ids:
            db.query(QuoteItem).filter(QuoteItem.quote_id.in_(demo_quote_ids)).delete(synchronize_session=False)
            db.query(Quote).filter(Quote.id.in_(demo_quote_ids)).delete(synchronize_session=False)

        db.query(Product).filter(Product.codigo.like(f"{DEMO_PREFIX}-%")).delete(synchronize_session=False)
        db.query(Client).filter(Client.cnpj.in_([client["cnpj"] for client in CLIENTS])).delete(synchronize_session=False)
        db.query(User).filter(User.email == "demo.seller@aulevi.local").delete(synchronize_session=False)
        db.commit()
        print("Demo data cleaned successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    command = sys.argv[1] if len(sys.argv) > 1 else "seed"
    if command == "seed":
        seed()
    elif command == "cleanup":
        cleanup()
    else:
        print("Usage: python scripts/seed_demo_data.py [seed|cleanup]")
        raise SystemExit(1)
