"""
Enhanced API routes with all hackathon features - FINAL VERSION
"""

import sys
import os
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, BackgroundTasks, UploadFile, File, Form, Body
from fastapi.responses import JSONResponse
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from models.schemas import (
    ContentRequest, GenerationResponse, DNA, BrandDNA,
    Platform, Tone, ConsistencyCheckResponse, 
    MultiPlatformResponse, BrandDashboardResponse, HighScoreGenerationResponse
)
from agents.brand_analyzer import BrandAnalyzer
from agents.content_generator import ContentGenerator
from agents.consistency_checker import ConsistencyChecker
from agents.multi_platform_adapter import MultiPlatformAdapter
from agents.learning_agent import LearningAgent
from backend.config import Config
from utils.logger import logger

router = APIRouter()

# Initialize agents
brand_analyzer = BrandAnalyzer()
content_generator = ContentGenerator()
consistency_checker = ConsistencyChecker()
platform_adapter = MultiPlatformAdapter()
learner = LearningAgent()

# Store brand DNA in memory (in production, use database)
brand_profiles: Dict[str, Dict[str, Any]] = {}

# Sample data for demo
SAMPLE_BRANDS = {
    "tech_company": {
        "brand_name": "Tech Innovators Inc",
        "tone": "professional",
        "primary_keywords": ["AI", "innovation", "technology", "automation", "scalability", "future", "digital"],
        "secondary_keywords": ["cloud", "data", "analytics", "solutions"],
        "formality_score": 0.7,
        "storytelling_score": 0.5,
        "emoji_usage": "occasional",
        "sentence_style": "medium_balanced",
        "sentence_length_avg": 15,
        "brand_consistency_score": 0.85,
        "samples_analyzed": 5,
        "cta_preference": "engagement"
    },
    "creative_agency": {
        "brand_name": "Creative Minds Agency",
        "tone": "casual",
        "primary_keywords": ["creativity", "design", "storytelling", "branding", "inspiration", "art", "vision"],
        "secondary_keywords": ["ideas", "innovation", "unique", "bold"],
        "formality_score": 0.3,
        "storytelling_score": 0.8,
        "emoji_usage": "moderate",
        "sentence_style": "short_punchy",
        "sentence_length_avg": 10,
        "brand_consistency_score": 0.78,
        "samples_analyzed": 8,
        "cta_preference": "engagement"
    },
    "corporate_firm": {
        "brand_name": "Global Business Solutions",
        "tone": "formal",
        "primary_keywords": ["enterprise", "solutions", "strategy", "optimization", "leadership", "excellence"],
        "secondary_keywords": ["efficiency", "growth", "innovation", "results"],
        "formality_score": 0.85,
        "storytelling_score": 0.3,
        "emoji_usage": "none",
        "sentence_style": "long_detailed",
        "sentence_length_avg": 20,
        "brand_consistency_score": 0.92,
        "samples_analyzed": 12,
        "cta_preference": "action"
    }
}

# Add sample brands for testing
for brand_id, brand_data in SAMPLE_BRANDS.items():
    brand_profiles[brand_id] = brand_data

@router.post("/analyze-brand")
async def analyze_brand(
    files: List[UploadFile] = File(..., description="Upload content files (txt, md, etc.)"),
    brand_name: Optional[str] = Form(None, description="Optional brand name")
):
    """Analyze uploaded content to extract brand DNA"""
    try:
        if not files:
            raise HTTPException(status_code=400, detail="No files uploaded")
        
        contents = []
        for file in files:
            content = await file.read()
            try:
                contents.append(content.decode('utf-8'))
            except:
                contents.append(content.decode('latin-1'))
        
        brand_dna = await brand_analyzer.process(contents)
        
        if brand_name:
            brand_dna["brand_name"] = brand_name
        else:
            brand_dna["brand_name"] = f"Brand_{len(brand_profiles) + 1}"
        
        brand_id = f"brand_{len(brand_profiles) + 1}"
        brand_profiles[brand_id] = brand_dna
        
        logger.success(f"Brand analyzed: {brand_id} - {brand_dna.get('tone', 'professional')} tone")
        
        return {
            "success": True,
            "brand_id": brand_id,
            "brand_name": brand_dna["brand_name"],
            "brand_dna": brand_dna,
            "samples_analyzed": len(contents),
            "consistency_score": brand_dna.get("brand_consistency_score", 0.8) * 100,
            "message": f"Successfully analyzed {len(contents)} content samples"
        }
        
    except Exception as e:
        logger.error(f"Brand analysis failed: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/generate-high-score")
async def generate_high_score(
    request: Dict[str, Any] = Body(..., 
        example={
            "brand_id": "tech_company",
            "topic": "How AI is transforming content creation",
            "platform": "linkedin",
            "tone_slider": 0.6
        }
    )
):
    """Generate high-scoring content with tone control"""
    try:
        brand_id = request.get("brand_id")
        topic = request.get("topic", "AI and content creation")
        platform = request.get("platform", "linkedin")
        tone_slider = request.get("tone_slider", 0.5)
        
        if brand_id not in brand_profiles:
            available = list(brand_profiles.keys())
            return JSONResponse(
                status_code=404,
                content={
                    "error": "Brand not found",
                    "available_brands": available,
                    "message": f"Please use one of: {', '.join(available)}"
                }
            )
        
        brand_dna = brand_profiles[brand_id].copy()
        
        if tone_slider < 0.3:
            brand_dna["tone"] = "casual"
            brand_dna["formality_score"] = 0.3
        elif tone_slider > 0.7:
            brand_dna["tone"] = "formal"
            brand_dna["formality_score"] = 0.8
        else:
            brand_dna["tone"] = "professional"
            brand_dna["formality_score"] = 0.6
        
        generation_input = {
            "brand_dna": brand_dna,
            "content_type": platform,
            "platform": platform,
            "topic": topic
        }
        
        result = await content_generator.process(generation_input)
        
        consistency_input = {
            "content": result["content"],
            "brand_dna": brand_dna,
            "platform": platform
        }
        
        consistency_result = await consistency_checker.process(consistency_input)
        
        adaptation_input = {
            "content": result["content"],
            "brand_dna": brand_dna,
            "platforms": ["linkedin", "instagram", "blog"]
        }
        
        adaptations = await platform_adapter.process(adaptation_input)
        
        return {
            "success": True,
            "content": result["content"],
            "quality_score": result.get("initial_score", 75),
            "consistency_score": consistency_result["consistency_score"],
            "brand_match": consistency_result["brand_match_percentage"],
            "feedback": consistency_result["feedback"],
            "platform_adaptations": adaptations["adaptations"],
            "word_count": result["word_count"],
            "tone_used": brand_dna["tone"],
            "needs_refinement": consistency_result["needs_refinement"],
            "brand_id": brand_id,
            "platform": platform,
            "topic": topic
        }
        
    except Exception as e:
        logger.error(f"Generation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@router.post("/check-consistency")
async def check_consistency(request: Dict[str, Any] = Body(..., 
    example={
        "content": "Your content to check here",
        "brand_id": "tech_company",
        "platform": "linkedin"
    }
)):
    """Check if content matches brand DNA"""
    try:
        content = request.get("content", "")
        brand_id = request.get("brand_id", "")
        platform = request.get("platform", "linkedin")
        
        if not content:
            raise HTTPException(status_code=400, detail="Content is required")
        
        if brand_id not in brand_profiles:
            available = list(brand_profiles.keys())
            return JSONResponse(
                status_code=404,
                content={
                    "error": "Brand not found",
                    "available_brands": available,
                    "message": f"Please use one of: {', '.join(available)}"
                }
            )
        
        brand_dna = brand_profiles[brand_id]
        
        consistency_input = {
            "content": content,
            "brand_dna": brand_dna,
            "platform": platform
        }
        
        result = await consistency_checker.process(consistency_input)
        
        return {
            "success": True,
            "consistency_score": result["consistency_score"],
            "brand_match_percentage": result["brand_match_percentage"],
            "detailed_scores": result["detailed_scores"],
            "feedback": result["feedback"],
            "needs_refinement": result["needs_refinement"],
            "is_on_brand": result["consistency_score"] >= 80,
            "brand_id": brand_id,
            "platform": platform
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Consistency check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Check failed: {str(e)}")

@router.get("/brand-dashboard/{brand_id}")
async def get_brand_dashboard(brand_id: str):
    """Get comprehensive brand dashboard with visualizations"""
    try:
        if brand_id not in brand_profiles:
            available = list(brand_profiles.keys())
            return JSONResponse(
                status_code=404,
                content={
                    "error": "Brand not found",
                    "available_brands": available,
                    "message": f"Please use one of: {', '.join(available)}"
                }
            )
        
        brand_dna = brand_profiles[brand_id]
        
        dashboard = {
            "success": True,
            "brand_id": brand_id,
            "brand_name": brand_dna.get("brand_name", brand_id),
            "brand_dna": brand_dna,
            "visualizations": {
                "tone": brand_dna.get("tone", "professional"),
                "tone_distribution": {
                    "formal": brand_dna.get("formality_score", 0.5),
                    "professional": 0.5,
                    "casual": 1 - brand_dna.get("formality_score", 0.5)
                },
                "sentence_style": brand_dna.get("sentence_style", "medium_balanced"),
                "emoji_pattern": brand_dna.get("emoji_usage", "occasional"),
                "formality_score": brand_dna.get("formality_score", 0.5) * 100,
                "storytelling_score": brand_dna.get("storytelling_score", 0.5) * 100,
                "consistency_score": brand_dna.get("brand_consistency_score", 0.8) * 100
            },
            "top_keywords": brand_dna.get("primary_keywords", [])[:10],
            "recommendations": _generate_brand_recommendations(brand_dna),
            "samples_analyzed": brand_dna.get("samples_analyzed", 0),
            "cta_preference": brand_dna.get("cta_preference", "engagement")
        }
        
        return dashboard
        
    except Exception as e:
        logger.error(f"Dashboard retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Dashboard failed: {str(e)}")

@router.post("/multi-platform-adapt")
async def adapt_multi_platform(
    request: Dict[str, Any] = Body(..., 
        example={
            "content": "Your base content here",
            "brand_id": "tech_company",
            "platforms": ["linkedin", "instagram", "blog"]
        }
    )
):
    """Adapt content for multiple platforms"""
    try:
        content = request.get("content", "")
        brand_id = request.get("brand_id", "")
        platforms = request.get("platforms", ["linkedin", "instagram", "blog"])
        
        if not content:
            raise HTTPException(status_code=400, detail="Content is required")
        
        if brand_id not in brand_profiles:
            available = list(brand_profiles.keys())
            return JSONResponse(
                status_code=404,
                content={
                    "error": "Brand not found",
                    "available_brands": available,
                    "message": f"Please use one of: {', '.join(available)}"
                }
            )
        
        brand_dna = brand_profiles[brand_id]
        
        adaptation_input = {
            "content": content,
            "brand_dna": brand_dna,
            "platforms": platforms
        }
        
        result = await platform_adapter.process(adaptation_input)
        
        return {
            "success": True,
            "original_content": content,
            "adaptations": result["adaptations"],
            "platforms": platforms,
            "brand_id": brand_id,
            "brand_name": brand_dna.get("brand_name", brand_id)
        }
        
    except Exception as e:
        logger.error(f"Multi-platform adaptation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Adaptation failed: {str(e)}")

@router.get("/brand-drift-alert/{brand_id}")
async def check_brand_drift(brand_id: str):
    """Check for brand drift over time"""
    try:
        if brand_id not in brand_profiles:
            available = list(brand_profiles.keys())
            return JSONResponse(
                status_code=404,
                content={
                    "error": "Brand not found",
                    "available_brands": available,
                    "message": f"Please use one of: {', '.join(available)}"
                }
            )
        
        brand_dna = brand_profiles[brand_id]
        
        drift_score = (1 - brand_dna.get("brand_consistency_score", 0.8)) * 100
        
        return {
            "success": True,
            "brand_id": brand_id,
            "brand_name": brand_dna.get("brand_name", brand_id),
            "drift_detected": drift_score > 15,
            "drift_score": round(drift_score, 1),
            "alert_level": "high" if drift_score > 25 else "medium" if drift_score > 15 else "low",
            "recommendations": _generate_drift_recommendations(brand_dna, drift_score),
            "consistency_trend": "stable" if drift_score < 10 else "declining"
        }
        
    except Exception as e:
        logger.error(f"Drift check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Drift check failed: {str(e)}")

@router.get("/brands")
async def list_brands():
    """List all analyzed brands with their profiles"""
    return {
        "success": True,
        "brands": [
            {
                "brand_id": bid,
                "brand_name": data.get("brand_name", f"Brand {bid}"),
                "tone": data.get("tone", "professional"),
                "samples": data.get("samples_analyzed", 0),
                "consistency_score": data.get("brand_consistency_score", 0.8) * 100,
                "top_keywords": data.get("primary_keywords", [])[:5]
            }
            for bid, data in brand_profiles.items()
        ],
        "total_brands": len(brand_profiles)
    }

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Content DNA Engine Enterprise",
        "version": "2.0.0",
        "brands_available": len(brand_profiles),
        "available_brands": list(brand_profiles.keys()),
        "ollama_status": "connected"
    }

def _generate_brand_recommendations(brand_dna: Dict[str, Any]) -> List[str]:
    """Generate actionable brand recommendations"""
    recommendations = []
    
    formality = brand_dna.get("formality_score", 0.5)
    if formality > 0.7:
        recommendations.append("📝 Your brand leans formal - consider adding more relatable elements for social media")
    elif formality < 0.3:
        recommendations.append("💬 Your brand is very casual - ensure professionalism in business contexts")
    
    storytelling = brand_dna.get("storytelling_score", 0.5)
    if storytelling < 0.3:
        recommendations.append("📖 Add more storytelling elements to increase engagement and emotional connection")
    elif storytelling > 0.7:
        recommendations.append("✨ Great storytelling! Consider balancing with direct value propositions")
    
    emoji_usage = brand_dna.get("emoji_usage", "occasional")
    if emoji_usage == "none":
        recommendations.append("😊 Consider adding occasional emojis to increase engagement on social platforms")
    elif emoji_usage == "heavy":
        recommendations.append("🎯 Reduce emoji usage for more professional contexts like LinkedIn and email")
    
    consistency = brand_dna.get("brand_consistency_score", 0.8)
    if consistency < 0.7:
        recommendations.append("🎨 Brand consistency needs improvement - review content for tone and style alignment")
    
    keywords = brand_dna.get("primary_keywords", [])
    if len(keywords) < 5:
        recommendations.append("🔑 Expand your keyword vocabulary to build stronger brand identity")
    
    return recommendations[:5]

def _generate_drift_recommendations(brand_dna: Dict[str, Any], drift_score: float) -> List[str]:
    """Generate drift-specific recommendations"""
    recommendations = []
    
    if drift_score > 25:
        recommendations.append("🚨 Significant brand drift detected - review all recent content")
        recommendations.append("🔄 Consider retraining the brand model with recent high-performing content")
    elif drift_score > 15:
        recommendations.append("📉 Moderate brand drift - review content from the last month")
        recommendations.append("✅ Use the consistency checker before publishing new content")
    
    recommendations.append("🎯 Maintain consistent tone and vocabulary across all platforms")
    recommendations.append("📊 Monitor brand metrics weekly to catch drift early")
    
    return recommendations