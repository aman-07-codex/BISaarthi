# BISaarthi Backend

FastAPI backend and PostgreSQL database layer for **BISaarthi** — AI Guide to Indian Standards & BIS Compliance.

---

## 1. Overview

The backend is built with **Python 3.10+ / FastAPI** and **SQLAlchemy 2.0 (asyncpg)** with **Alembic** migrations, prepared for:
- Supabase PostgreSQL relational database schema (14 core domain tables)
- Safe development startup (graceful startup if credentials are not yet configured)
- Standardized API error handling (`docs/api.md` envelope)
- Centralized structured logging with sensitive field masking
- pgvector-ready knowledge base chunk schema

---

## 2. Project Structure

```
backend/
├── alembic/                 # Alembic migration environment
│   ├── versions/            # Migration revisions (e.g. 20260908_0001_initial_schema.py)
│   ├── env.py               # Async Alembic execution runner
│   └── script.py.mako       # Migration template
├── alembic.ini              # Alembic configuration
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app factory, lifespan, CORS, and middleware
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # Centralized Pydantic Settings
│   │   ├── logging.py       # Safe, structured logging
│   │   └── errors.py        # Standardized error envelope & exception handlers
│   ├── db/
│   │   ├── __init__.py
│   │   └── session.py       # SQLAlchemy async engine, sessionmaker, and Base
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py  # Root API router
│   │       └── health.py    # GET /api/health endpoint
│   ├── models/              # SQLAlchemy 2.0 ORM models
│   │   ├── __init__.py
│   │   ├── user.py          # User accounts
│   │   ├── conversation.py  # Conversations & Messages (Chatbot history)
│   │   ├── source.py        # Authoritative sources
│   │   ├── standard.py      # Standards, Requirements, Tests, Certification Steps
│   │   ├── laboratory.py    # Recognized testing laboratories
│   │   ├── saved_standard.py# User bookmarked standards
│   │   ├── comparison.py    # Pairwise standard comparisons (exactly 2)
│   │   ├── uploaded_document.py # User uploaded context docs
│   │   └── knowledge_chunk.py   # BIS knowledge base chunks
│   ├── schemas/             # Pydantic DTO schemas
│   └── services/            # Domain services
├── tests/                   # Automated backend test suite
│   ├── __init__.py
│   ├── test_health.py       # Health check & error envelope tests
│   └── test_models.py       # Model metadata, foreign key & constraint tests
├── .env.example             # Example environment configuration
├── .gitignore
├── requirements.txt         # Backend dependencies
└── README.md
```

---

## 3. Supabase PostgreSQL Configuration

### Step 1: Obtain Connection String from Supabase
1. Log in to the [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project and navigate to **Project Settings** > **Database**.
3. Under **Connection string**, select **URI** (or Transaction Pooler / Session Pooler if using IPv4/serverless).
4. Format:
   ```env
   DATABASE_URL=postgresql+asyncpg://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   *(Note: prefix with `postgresql+asyncpg://` for async engine).*

### Step 2: Enable PostgreSQL Extensions on Supabase
Under **Database** > **Extensions** in the Supabase Dashboard, ensure the following extensions are enabled:
- `pgcrypto` (UUID generation)
- `pg_trgm` (Trigram fuzzy search)
- `vector` (pgvector for knowledge base embeddings)

### Step 3: Configure `.env`
Copy `.env.example` to `.env` and set your credentials:

```bash
# Windows
copy .env.example .env

# Linux / macOS
cp .env.example .env
```

---

## 4. Setup & Running Migrations

### Virtual Environment Setup
From the `backend` directory:

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Apply Database Migrations
Run the Alembic migration against your configured PostgreSQL database:

```bash
alembic upgrade head
```

To view SQL without executing:
```bash
alembic upgrade head --sql
```

To roll back:
```bash
alembic downgrade -1
```

---

## 5. Running the Backend Server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://127.0.0.1:8000`.

---

## 6. Verification & Endpoints

- **Health Check:** `GET http://127.0.0.1:8000/api/health`
  ```json
  {
    "status": "ok",
    "service": "BISaarthi API"
  }
  ```
- **Interactive Swagger UI:** `http://127.0.0.1:8000/docs`
- **ReDoc UI:** `http://127.0.0.1:8000/redoc`

### Run Backend Tests
```bash
pytest
```
