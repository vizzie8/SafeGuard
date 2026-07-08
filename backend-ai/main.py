from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

app = FastAPI(title="SafeGuard AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RiskRequest(BaseModel):
    lat: float
    lng: float
    time_of_day: str

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-backend"}

@app.post("/analyze-risk")
def analyze_risk(req: RiskRequest):
    # Dummy logic to be replaced with RAG/FAISS
    base_risk = 0.2
    if req.time_of_day == "night":
        base_risk += 0.5
        
    return {
        "risk_score": base_risk,
        "recommendation": "Avoid unlit areas." if base_risk > 0.5 else "Safe to proceed."
    }
