"""
Critic Agent - Scores generated content based on various metrics
"""

from typing import Any, Dict, List
from agents.base_agent import BaseAgent
from utils.text_processor import text_processor

class CriticAgent(BaseAgent):
    """Agent responsible for evaluating and scoring content"""
    
    def __init__(self):
        super().__init__("Critic Agent")
    
    async def process(self, input_data: Any, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Score generated content
        
        Args:
            input_data: Dictionary with content and DNA
            context: Additional context
            
        Returns:
            Dictionary with score and feedback
        """
        self.log_start()
        
        content = input_data.get("content", "")
        dna = input_data.get("dna", {})
        content_type = input_data.get("content_type", "linkedin")
        
        # Calculate scores
        scores = {}
        
        # 1. Sentence length score (0-25)
        style = text_processor.analyze_sentence_style(content)
        target_length = dna.get("avg_sentence_length", 15)
        length_diff = abs(style["avg_length"] - target_length)
        scores["sentence_length"] = max(0, 25 - min(25, length_diff * 2))
        
        # 2. Keyword usage score (0-25)
        extracted_keywords = set(text_processor.extract_keywords(content, limit=10))
        target_keywords = set(dna.get("keywords", [])[:5])
        if target_keywords:
            keyword_match = len(extracted_keywords & target_keywords) / len(target_keywords)
            scores["keyword_usage"] = int(keyword_match * 25)
        else:
            scores["keyword_usage"] = 15
        
        # 3. Tone match score (0-25)
        detected_tone = text_processor.detect_tone(content)
        target_tone = dna.get("tone", "professional")
        scores["tone_match"] = 25 if detected_tone == target_tone else 15
        
        # 4. Emoji control and formatting (0-25)
        emoji_count = sum(1 for char in content if char in '😊❤️✨🙌🔥💯👍')
        
        # Platform-specific emoji limits
        emoji_limits = {"blog": 0, "linkedin": 1, "instagram": 2}
        limit = emoji_limits.get(content_type, 2)
        
        if emoji_count <= limit:
            scores["emoji_control"] = 25
        else:
            scores["emoji_control"] = max(0, 25 - (emoji_count - limit) * 5)
        
        # Calculate total score and convert to integer
        total_score = int(sum(scores.values()))
        
        # Generate feedback
        feedback = []
        if scores["sentence_length"] < 20:
            feedback.append("Sentence length could better match target")
        if scores["keyword_usage"] < 20:
            feedback.append("Consider incorporating more key themes")
        if scores["tone_match"] < 20:
            feedback.append(f"Tone should be more {target_tone}")
        if scores["emoji_control"] < 20:
            feedback.append(f"Adjust emoji usage for {content_type} platform")
        
        self.logger.scoring(f"Score: {total_score}/100")
        self.log_complete()
        
        return {
            "score": total_score,
            "scores": scores,
            "feedback": feedback,
            "meets_threshold": total_score >= 80
        }