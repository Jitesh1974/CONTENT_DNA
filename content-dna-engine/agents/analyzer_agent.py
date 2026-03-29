"""
Enhanced Analyzer Agent for Enterprise - Extracts comprehensive content DNA
"""

from typing import Any, Dict, List
from agents.base_agent import BaseAgent
from utils.text_processor import text_processor
import re

class AnalyzerAgent(BaseAgent):
    """Enhanced agent for analyzing content and extracting detailed DNA"""
    
    def __init__(self):
        super().__init__("Analyzer Agent")
    
    async def process(self, input_data: Any, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyze content and extract comprehensive DNA
        
        Args:
            input_data: Content to analyze
            context: Additional context
            
        Returns:
            Dictionary with extracted DNA
        """
        self.log_start()
        
        content = input_data if isinstance(input_data, str) else input_data.get("content", "")
        content_type = context.get("content_type", "blog_post") if context else "blog_post"
        
        # Handle large text with chunking
        word_count = len(content.split())
        
        if word_count > 500:
            self.logger.analyzing(f"Large text detected ({word_count} words), chunking for analysis...")
            chunks = text_processor.chunk_text(content, chunk_size=300)
            aggregated = text_processor.aggregate_analysis(chunks)
            
            dna = {
                "tone": aggregated["tone"],
                "keywords": aggregated["keywords"],
                "avg_sentence_length": aggregated["avg_sentence_length"],
                "content_type": content_type,
                "word_count": word_count,
                "seo_keywords": self._extract_seo_keywords(content),
                "readability_score": self._calculate_readability(content),
                "heading_structure": self._analyze_headings(content)
            }
        else:
            # Analyze directly
            self.logger.analyzing("Analyzing content...")
            tone = text_processor.detect_tone(content)
            keywords = text_processor.extract_keywords(content, limit=20)
            style = text_processor.analyze_sentence_style(content)
            
            dna = {
                "tone": tone,
                "keywords": keywords,
                "avg_sentence_length": style["avg_length"],
                "content_type": content_type,
                "word_count": word_count,
                "seo_keywords": self._extract_seo_keywords(content),
                "readability_score": self._calculate_readability(content),
                "heading_structure": self._analyze_headings(content)
            }
        
        self.logger.success(f"DNA extracted: Tone={dna['tone']}, Keywords={len(dna['keywords'])}, "
                           f"Words={dna['word_count']}")
        self.log_complete()
        
        return {"dna": dna, "raw_analysis": {}}
    
    def _extract_seo_keywords(self, text: str, limit: int = 10) -> List[str]:
        """Extract SEO-optimized keywords with importance scoring"""
        # Simple TF-IDF style extraction
        words = text.lower().split()
        word_freq = {}
        
        for word in words:
            if len(word) > 3 and word.isalpha():
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Sort by frequency
        sorted_keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [kw for kw, _ in sorted_keywords[:limit]]
    
    def _calculate_readability(self, text: str) -> Dict[str, Any]:
        """Calculate readability scores"""
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        words = text.split()
        
        if not sentences:
            return {"flesch_score": 0, "grade_level": "Unknown"}
        
        # Simple Flesch Reading Ease approximation
        avg_sentence_length = len(words) / len(sentences)
        avg_syllables_per_word = 1.4  # Approximation
        
        flesch_score = 206.835 - (1.015 * avg_sentence_length) - (84.6 * avg_syllables_per_word)
        
        # Grade level approximation
        if flesch_score > 90:
            grade_level = "5th grade"
        elif flesch_score > 80:
            grade_level = "6th grade"
        elif flesch_score > 70:
            grade_level = "7th grade"
        elif flesch_score > 60:
            grade_level = "8th-9th grade"
        elif flesch_score > 50:
            grade_level = "10th-12th grade"
        else:
            grade_level = "College"
        
        return {
            "flesch_score": round(flesch_score, 2),
            "grade_level": grade_level,
            "avg_sentence_length": round(avg_sentence_length, 1)
        }
    
    def _analyze_headings(self, text: str) -> Dict[str, Any]:
        """Analyze heading structure"""
        h1_count = text.count('\n# ') + text.count('\n#')
        h2_count = text.count('\n## ') + text.count('\n##')
        h3_count = text.count('\n### ') + text.count('\n###')
        
        return {
            "h1_count": h1_count,
            "h2_count": h2_count,
            "h3_count": h3_count,
            "total_headings": h1_count + h2_count + h3_count
        }