"""
Main FastAPI application for Content DNA Engine
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router
from utils.logger import logger
import sys
import os

# Add the parent directory to sys.path to fix imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Create FastAPI app
app = FastAPI(
    title="Content DNA Engine",
    description="Multi-agent AI system for content analysis and generation",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router, prefix="/api/v1", tags=["content"])

@app.on_event("startup")
async def startup_event():
    """Startup event handler"""
    logger.success("Content DNA Engine started successfully")
    logger.info("Using Ollama for LLM operations")
    logger.info(f"Python version: {sys.version}")

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler"""
    logger.info("Content DNA Engine shutting down")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Content DNA Engine",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "generate": "/api/v1/generate",
            "analyze": "/api/v1/analyze-only",
            "health": "/api/v1/health"
        }
    }