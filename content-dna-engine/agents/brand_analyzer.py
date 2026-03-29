"""
Advanced Brand Analyzer - Extracts comprehensive brand DNA from samples
"""

from typing import Any, Dict, List, Optional
from agents.base_agent import BaseAgent
from utils.text_processor import text_processor
from collections import Counter
import re
import numpy as np

class BrandAnalyzer(BaseAgent):
    """Advanced agent for extracting complete brand DNA"""
    
    def __init__(self):
        super().__init__("Brand Analyzer")
        self.samples_processed = 0
    
    async def process(self, input_data: Any, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyze multiple content samples to extract brand DNA
        
        Args:
            input_data: List of content samples or single content string
            context: Additional context
            
        Returns:
            Comprehensive brand DNA profile
        """
        self.log_start()
        
        # Handle multiple samples
        if isinstance(input_data, list):
            samples = input_data
        else:
            samples = [input_data]
        
        self.samples_processed = len(samples)
        self.logger.info(f"Analyzing {len(samples)} content samples...")
        
        # Aggregate analysis
        all_tones = []
        all_keywords = []
        sentence_lengths = []
        emoji_counts = []
        formality_scores = []
        storytelling_scores = []
        cta_patterns = []
        
        for sample in samples:
            # Tone detection with confidence
            tone_result = self._analyze_tone_detailed(sample)
            all_tones.append(tone_result)
            
            # Keywords with importance
            keywords = text_processor.extract_keywords(sample, limit=15)
            all_keywords.extend(keywords)
            
            # Sentence structure
            sentences = self._extract_sentences(sample)
            if sentences:
                avg_len = sum(len(s.split()) for s in sentences) / len(sentences)
                sentence_lengths.append(avg_len)
            
            # Emoji usage
            emoji_count = len(re.findall(r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\u2600-\u26FF\u2700-\u27BF]', sample))
            emoji_counts.append(emoji_count)
            
            # Formality score
            formality_scores.append(self._calculate_formality(sample))
            
            # Storytelling score
            storytelling_scores.append(self._calculate_storytelling(sample))
            
            # CTA patterns
            if self._has_cta(sample):
                cta_patterns.append(self._extract_cta_type(sample))
        
        # Build comprehensive DNA
        brand_dna = {
            "tone": self._get_dominant_tone(all_tones),
            "tone_confidence": self._calculate_tone_confidence(all_tones),
            "primary_keywords": self._get_top_keywords(all_keywords, 15),
            "secondary_keywords": self._get_top_keywords(all_keywords, 10, offset=15),
            "sentence_style": self._get_sentence_style(sentence_lengths),
            "avg_sentence_length": np.mean(sentence_lengths) if sentence_lengths else 15,
            "emoji_usage": self._get_emoji_pattern(emoji_counts),
            "formality_score": np.mean(formality_scores) if formality_scores else 0.5,
            "storytelling_score": np.mean(storytelling_scores) if storytelling_scores else 0.5,
            "cta_preference": self._get_cta_preference(cta_patterns),
            "vocabulary_patterns": self._extract_vocabulary_patterns(all_keywords),
            "samples_analyzed": len(samples),
            "brand_consistency_score": self._calculate_consistency(sentence_lengths, emoji_counts)
        }
        
        self.logger.success(f"Brand DNA extracted: {brand_dna['tone']} tone, "
                           f"Consistency: {brand_dna['brand_consistency_score']:.1%}")
        self.log_complete()
        
        return brand_dna
    
    def _analyze_tone_detailed(self, text: str) -> Dict[str, float]:
        """Detailed tone analysis with confidence scores"""
        text_lower = text.lower()
        
        tone_indicators = {
            "formal": ["therefore", "hence", "thus", "pursuant", "whereas", "furthermore"],
            "professional": ["please", "thank you", "regards", "opportunity", "solution"],
            "friendly": ["hey", "hi", "great", "awesome", "thanks", "appreciate"],
            "casual": ["lol", "omg", "hey", "guys", "cool", "literally"],
            "humorous": ["funny", "hilarious", "lol", "😂", "😅", "joke"]
        }
        
        scores = {}
        for tone, indicators in tone_indicators.items():
            count = sum(1 for ind in indicators if ind in text_lower)
            scores[tone] = min(1.0, count / 5)
        
        # Normalize
        total = sum(scores.values())
        if total > 0:
            scores = {k: v/total for k, v in scores.items()}
        
        # Add dominant tone
        dominant = max(scores.items(), key=lambda x: x[1]) if scores else ("professional", 0.5)
        
        return {"dominant": dominant[0], "confidence": dominant[1], "all_scores": scores}
    
    def _calculate_formality(self, text: str) -> float:
        """Calculate formality score (0=casual, 1=formal)"""
        formal_indicators = ["therefore", "hence", "thus", "pursuant", "whereas", 
                            "furthermore", "nevertheless", "accordingly"]
        casual_indicators = ["lol", "omg", "hey", "guys", "cool", "awesome", 
                            "literally", "basically", "actually"]
        
        formal_count = sum(1 for w in formal_indicators if w in text.lower())
        casual_count = sum(1 for w in casual_indicators if w in text.lower())
        
        total = formal_count + casual_count
        if total == 0:
            return 0.5
        
        return formal_count / total
    
    def _calculate_storytelling(self, text: str) -> float:
        """Calculate storytelling score (0=direct, 1=storytelling)"""
        storytelling_patterns = [
            r'\b(once|when|then|after|before|while)\b',
            r'\b(I|we) (realized|discovered|learned|found)\b',
            r'\b(the journey|our experience|what happened)\b'
        ]
        
        direct_patterns = [
            r'\b(here are|below is|the following|in summary)\b',
            r'\b(we offer|our service|we provide)\b'
        ]
        
        story_count = sum(len(re.findall(p, text, re.IGNORECASE)) for p in storytelling_patterns)
        direct_count = sum(len(re.findall(p, text, re.IGNORECASE)) for p in direct_patterns)
        
        total = story_count + direct_count
        if total == 0:
            return 0.5
        
        return min(1.0, story_count / total)
    
    def _has_cta(self, text: str) -> bool:
        """Check if content has call-to-action"""
        cta_patterns = [
            r'\b(click|sign up|subscribe|follow|contact|visit|learn more|get started)\b',
            r'\b(share your|let us know|comment below|reach out|dm us)\b'
        ]
        return any(re.search(p, text, re.IGNORECASE) for p in cta_patterns)
    
    def _extract_cta_type(self, text: str) -> str:
        """Extract type of call-to-action"""
        if re.search(r'\b(click|sign up|subscribe)\b', text, re.IGNORECASE):
            return "action"
        elif re.search(r'\b(share|comment|let us know)\b', text, re.IGNORECASE):
            return "engagement"
        elif re.search(r'\b(contact|visit|dm)\b', text, re.IGNORECASE):
            return "connection"
        return "none"
    
    def _get_dominant_tone(self, tones: List[Dict]) -> str:
        """Get dominant tone from multiple analyses"""
        tone_counts = Counter([t["dominant"] for t in tones])
        return tone_counts.most_common(1)[0][0]
    
    def _calculate_tone_confidence(self, tones: List[Dict]) -> float:
        """Calculate average tone confidence"""
        return np.mean([t["confidence"] for t in tones])
    
    def _get_top_keywords(self, keywords: List[str], limit: int, offset: int = 0) -> List[str]:
        """Get top keywords with frequency"""
        counter = Counter(keywords)
        return [kw for kw, _ in counter.most_common(limit + offset)][offset:offset+limit]
    
    def _get_sentence_style(self, lengths: List[float]) -> str:
        """Determine sentence style based on lengths"""
        avg = np.mean(lengths) if lengths else 15
        if avg < 10:
            return "short_punchy"
        elif avg < 18:
            return "medium_balanced"
        else:
            return "long_detailed"
    
    def _get_emoji_pattern(self, counts: List[int]) -> str:
        """Determine emoji usage pattern"""
        avg = np.mean(counts) if counts else 0
        if avg == 0:
            return "none"
        elif avg < 2:
            return "occasional"
        elif avg < 5:
            return "moderate"
        else:
            return "heavy"
    
    def _get_cta_preference(self, ctas: List[str]) -> str:
        """Get most common CTA type"""
        if not ctas:
            return "none"
        return Counter(ctas).most_common(1)[0][0]
    
    def _extract_vocabulary_patterns(self, keywords: List[str]) -> Dict[str, Any]:
        """Extract vocabulary patterns and industry terms"""
        counter = Counter(keywords)
        
        # Identify industry-specific terms
        industry_terms = [kw for kw, _ in counter.most_common(20) 
                         if len(kw) > 5 and kw.isalpha()]
        
        return {
            "unique_terms": industry_terms[:10],
            "repeated_phrases": [],  # Would need n-gram analysis
            "key_verbs": [kw for kw, _ in counter.most_common(10) 
                         if kw.endswith('ing') or kw.endswith('ize')]
        }
    
    def _extract_sentences(self, text: str) -> List[str]:
        """Extract sentences from text"""
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if s.strip() and len(s.split()) > 2]
    
    def _calculate_consistency(self, lengths: List[float], emojis: List[int]) -> float:
        """Calculate brand consistency score"""
        if len(lengths) < 2:
            return 0.8
        
        length_std = np.std(lengths)
        emoji_std = np.std(emojis)
        
        # Normalize to 0-1
        length_consistency = max(0, 1 - (length_std / 20))
        emoji_consistency = max(0, 1 - (emoji_std / 3))
        
        return (length_consistency + emoji_consistency) / 2