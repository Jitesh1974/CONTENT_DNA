"""
Enhanced Pydantic models for Brand DNA Engine
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from enum import Enum

class Tone(str, Enum):
    FORMAL = "formal"
    PROFESSIONAL = "professional"
    FRIENDLY = "friendly"
    CASUAL = "casual"
    HUMOROUS = "humorous"

class Platform(str, Enum):
    LINKEDIN = "linkedin"
    INSTAGRAM = "instagram"
    TWITTER = "twitter"
    BLOG = "blog"
    EMAIL = "email"
    NEWSLETTER = "newsletter"

class ContentRequest(BaseModel):
    """Enterprise request model for content generation"""
    content: str = Field(..., min_length=1, description="Content to analyze")
    content_type: Optional[str] = Field("blog_post", description="Type of content to generate")
    topic_keywords: Optional[List[str]] = Field(None, description="Specific topic keywords")
    target_words: Optional[int] = Field(None, description="Target word count")

class BrandDNA(BaseModel):
    """Complete Brand DNA Profile"""
    brand_name: Optional[str] = None
    tone: Union[Tone, str] = Tone.PROFESSIONAL
    tone_score: Dict[str, float] = Field(default_factory=dict)
    tone_confidence: Optional[Dict[str, float]] = Field(default_factory=dict)
    sentence_length_avg: float = 15.0
    sentence_style: str = "medium_balanced"
    emoji_usage: str = "occasional"
    formality_score: float = 0.5
    storytelling_score: float = 0.5
    brand_consistency_score: float = 0.8
    primary_keywords: List[str] = Field(default_factory=list)
    secondary_keywords: List[str] = Field(default_factory=list)
    vocabulary_patterns: Dict[str, Any] = Field(default_factory=dict)
    cta_preference: str = "engagement"
    samples_analyzed: int = 0
    
    class Config:
        use_enum_values = True

class DNA(BaseModel):
    """Basic Content DNA model"""
    tone: str
    keywords: List[str]
    avg_sentence_length: float
    content_type: str

class GenerationResponse(BaseModel):
    """Enhanced response model for enterprise"""
    final_content: str
    score: int
    iterations: int
    dna: DNA
    refinement_history: Optional[List[str]] = None
    word_count: int
    reading_time: int
    seo_score: int
    
    @validator('score')
    def validate_score(cls, v):
        if isinstance(v, float):
            v = int(v)
        if v < 0 or v > 100:
            raise ValueError(f"Score must be between 0 and 100, got {v}")
        return v

class AnalysisResponse(BaseModel):
    """Response model for analysis"""
    dna: DNA
    raw_analysis: Dict[str, Any]

class AgentResult(BaseModel):
    """Base model for agent results"""
    success: bool
    data: Any
    message: Optional[str] = None

class ConsistencyCheckResponse(BaseModel):
    """Response model for consistency checking"""
    consistency_score: float
    brand_match_percentage: float
    detailed_scores: Dict[str, float]
    feedback: List[str]
    needs_refinement: bool
    is_on_brand: bool = False

class MultiPlatformResponse(BaseModel):
    """Response model for multi-platform adaptation"""
    original_content: str
    adaptations: Dict[str, str]
    platforms: List[str]
    brand_id: str

class BrandDashboardResponse(BaseModel):
    """Response model for brand dashboard"""
    brand_id: str
    brand_dna: BrandDNA
    visualizations: Dict[str, Any]
    top_keywords: List[str]
    recommendations: List[str]
    drift_alert: Optional[Dict[str, Any]] = None

class HighScoreGenerationResponse(BaseModel):
    """Response model for high-score content generation"""
    content: str
    quality_score: int
    consistency_score: float
    brand_match: float
    feedback: List[str]
    platform_adaptations: Dict[str, str]
    word_count: int
    tone_used: str
    needs_refinement: bool