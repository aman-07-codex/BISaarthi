import asyncio
from sqlalchemy import text
from app.db.session import init_db_engine
from app.models.standard import Standard

async def main():
    engine = init_db_engine()
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'standards';"))
        cols = res.fetchall()
        print("Columns in standards table:")
        for c in cols:
            print(" ", c[0], c[1])
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
