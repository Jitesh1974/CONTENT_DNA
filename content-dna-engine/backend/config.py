"""
Enterprise Configuration settings for Content DNA Engine
"""

import os
from typing import Dict, Any

class Config:
    """Enterprise configuration class"""
    
    # LLM Settings
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    DEFAULT_MODEL = "mistral"
    FALLBACK_MODEL = "llama3"
    LLM_TIMEOUT = 60  # Increased for longer content
    MAX_TOKENS = 2000  # Increased for blog posts
    
    # Text Processing - Enterprise settings
    CHUNK_SIZE = 300  # Increased for better context
    MAX_KEYWORDS = 20  # More keywords for SEO
    MAX_CONTENT_WORDS = 5000  # Support for long-form content
    MIN_CONTENT_WORDS = 300
    
    # Agent Settings
    MIN_ACCEPTABLE_SCORE = 85  # Higher quality threshold
    MAX_REFINEMENT_ITERATIONS = 3  # More refinements for quality
    
    # SEO Settings
    TARGET_KEYWORD_DENSITY = 0.025  # 2.5% keyword density
    MAX_HEADINGS = 6
    RECOMMENDED_READING_TIME = 7  # minutes
    
    # Content Types for Enterprise
    CONTENT_TYPES = {
        "blog_post": {
            "min_words": 800,
            "max_words": 3000,
            "structure": "comprehensive",
            "seo_priority": "high",
            "sections": ["introduction", "body", "conclusion", "call_to_action"]
        },
        "article": {
            "min_words": 500,
            "max_words": 2000,
            "structure": "structured",
            "seo_priority": "medium",
            "sections": ["overview", "key_points", "analysis", "summary"]
        },
        "case_study": {
            "min_words": 1000,
            "max_words": 4000,
            "structure": "detailed",
            "seo_priority": "high",
            "sections": ["background", "challenge", "solution", "results", "conclusion"]
        },
        "white_paper": {
            "min_words": 2000,
            "max_words": 5000,
            "structure": "academic",
            "seo_priority": "medium",
            "sections": ["abstract", "introduction", "methodology", "findings", "conclusion", "references"]
        },
        "linkedin_article": {
            "min_words": 300,
            "max_words": 1500,
            "structure": "professional",
            "seo_priority": "low",
            "sections": ["hook", "insights", "examples", "call_to_action"]
        }
    }
    
    # Learning Settings
    LEARNING_ENABLED = True
    KNOWLEDGE_BASE_PATH = "data/knowledge_base.json"
    CONTENT_HISTORY_PATH = "data/content_history.json"
    MAX_HISTORY_ENTRIES = 1000
    
    # Performance Monitoring
    ENABLE_METRICS = True
    LOG_LEVEL = "INFO"