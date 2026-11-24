from fastapi import APIRouter, HTTPException, status, Depends, FastAPI
from sqlalchemy import select
from sqlalchemy.orm import Session
from database import get_db

app = FastAPI(
    title="ShieldID Provider",
    description="Decentralized Identity and Credential Issuer",
    version="1.0.0"
)

@app.get("/")
def home():
    return {"message" : "ShieldID API is running"}

