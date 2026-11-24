from dotenv import load_dotenv
import os
from sqlalchemy import create_engine
# from sqlalchemy import text  this converts a sql query to text and lets us run the command
from sqlalchemy.orm import sessionmaker # This helps us execute sql commands
from base import Base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(url=DATABASE_URL) # type: ignore
SessionLocal = sessionmaker(
    autocommit= False,
    autoflush=False,
    bind=engine
)   
# with engine.connect() as conn:
#     conn.execute(text("SELECT 1")).scalar()

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

Base.metadata.create_all(bind=engine) # automatically creates all the database tables defined by your SQLAlchemy