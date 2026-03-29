"""
Text processing utilities for chunking, keyword extraction, and analysis
"""

import re
from typing import List, Tuple, Dict, Any
from collections import Counter
import spacy
from utils.logger import logger

class TextProcessor:
    """Handles all text processing operations"""
    
    def __init__(self):
        """Initialize spaCy model"""
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning("Downloading spaCy model...")
            import subprocess
            import sys
            subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
            self.nlp = spacy.load("en_core_web_sm")
    
    def chunk_text(self, text: str, chunk_size: int = 150) -> List[str]:
        """
        Split text into chunks of approximately chunk_size words
        
        Args:
            text: Input text to chunk
            chunk_size: Target number of words per chunk
            
        Returns:
            List of text chunks
        """
        words = text.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size):
            chunk = ' '.join(words[i:i + chunk_size])
            chunks.append(chunk)
        
        logger.info(f"Split text into {len(chunks)} chunks")
        return chunks
    
    def extract_keywords(self, text: str, limit: int = 10) -> List[str]:
        """
        Extract keywords using spaCy (NOUN and PROPN)
        
        Args:
            text: Input text
            limit: Maximum number of keywords to return
            
        Returns:
            List of keywords
        """
        doc = self.nlp(text)
        keywords = []
        
        for token in doc:
            if token.pos_ in ['NOUN', 'PROPN'] and not token.is_stop:
                keywords.append(token.lemma_.lower())
        
        # Count frequencies and get top keywords
        keyword_counts = Counter(keywords)
        top_keywords = [kw for kw, _ in keyword_counts.most_common(limit)]
        
        logger.info(f"Extracted {len(top_keywords)} keywords")
        return top_keywords
    
    def detect_tone(self, text: str) -> str:
        """
        Detect tone based on simple rules
        
        Args:
            text: Input text
            
        Returns:
            Tone: 'casual', 'professional', or 'formal'
        """
        casual_indicators = ['lol', 'omg', 'hey', 'hi', 'awesome', 'cool', '😊', '❤️', '✨', '🚀', '🙌']
        formal_indicators = ['therefore', 'hence', 'thus', 'pursuant', 'whereas', 'furthermore']
        
        text_lower = text.lower()
        
        # Check for casual indicators
        if any(indicator in text_lower for indicator in casual_indicators):
            tone = 'casual'
        # Check for formal indicators
        elif any(indicator in text_lower for indicator in formal_indicators):
            tone = 'formal'
        else:
            tone = 'professional'
        
        logger.info(f"Detected tone: {tone}")
        return tone
    
    def analyze_sentence_style(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentence style including length and complexity
        
        Args:
            text: Input text
            
        Returns:
            Dictionary with sentence style metrics
        """
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if not sentences:
            return {"avg_length": 0, "style": "unknown"}
        
        # Calculate average sentence length in words
        avg_length = sum(len(s.split()) for s in sentences) / len(sentences)
        
        # Determine style based on average length
        if avg_length < 10:
            style = "short"
        elif avg_length < 20:
            style = "medium"
        else:
            style = "long"
        
        return {
            "avg_length": round(avg_length, 2),
            "style": style,
            "sentence_count": len(sentences)
        }
    
    def aggregate_analysis(self, chunks: List[str]) -> Dict[str, Any]:
        """
        Aggregate analysis results from multiple chunks
        
        Args:
            chunks: List of text chunks
            
        Returns:
            Aggregated analysis results
        """
        all_keywords = []
        tones = []
        sentence_styles = []
        
        for chunk in chunks:
            keywords = self.extract_keywords(chunk, limit=5)
            all_keywords.extend(keywords)
            tones.append(self.detect_tone(chunk))
            sentence_styles.append(self.analyze_sentence_style(chunk))
        
        # Get majority tone
        tone_counts = Counter(tones)
        majority_tone = tone_counts.most_common(1)[0][0]
        
        # Get top keywords overall
        keyword_counts = Counter(all_keywords)
        top_keywords = [kw for kw, _ in keyword_counts.most_common(10)]
        
        # Average sentence length
        avg_sentence_length = sum(style['avg_length'] for style in sentence_styles) / len(sentence_styles)
        
        logger.success(f"Aggregation complete - Tone: {majority_tone}, Keywords: {len(top_keywords)}")
        
        return {
            "tone": majority_tone,
            "keywords": top_keywords,
            "avg_sentence_length": round(avg_sentence_length, 2),
            "chunks_analyzed": len(chunks)
        }
    
    def detect_content_type(self, text: str) -> str:
        """
        Detect content type based on length and keywords
        
        Args:
            text: Input text
            
        Returns:
            Content type: 'blog', 'linkedin', or 'instagram'
        """
        word_count = len(text.split())
        text_lower = text.lower()
        
        # Check for Instagram patterns
        if any(emoji in text for emoji in ['❤️', '✨', '🙌', '🔥']) or word_count < 100:
            return 'instagram'
        
        # Check for LinkedIn patterns
        if any(kw in text_lower for kw in ['excited to share', 'professional', 'career', 'network', 'announce']):
            return 'linkedin'
        
        # Check for Blog patterns
        if word_count > 300 or any(kw in text_lower for kw in ['introduction', 'conclusion', 'firstly', 'secondly', 'finally']):
            return 'blog'
        
        return 'linkedin'  # Default to LinkedIn

# Create global instance
text_processor = TextProcessor()