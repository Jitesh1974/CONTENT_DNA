"""
Learning Agent - Provides recommendations based on historical content patterns
"""

from typing import Any, Dict, List
from agents.base_agent import BaseAgent
from utils.content_learner import content_learner

class LearningAgent(BaseAgent):
    """Agent responsible for learning from past content and providing recommendations"""
    
    def __init__(self):
        super().__init__("Learning Agent")
    
    async def process(self, input_data: Any, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Provide recommendations based on learned patterns
        
        Args:
            input_data: Content type and topic keywords
            context: Additional context
            
        Returns:
            Recommendations for content generation
        """
        self.log_start()
        
        content_type = input_data.get("content_type", "blog_post")
        topic_keywords = input_data.get("topic_keywords", [])
        
        # Get recommendations from learner
        recommendations = content_learner.get_recommendations(content_type, topic_keywords)
        
        self.logger.info(f"Recommendations: Tone={recommendations['suggested_tone']}, "
                        f"Keywords={len(recommendations['suggested_keywords'])}")
        
        self.log_complete()
        
        return recommendations
    
    async def learn(self, content: str, dna: Dict, score: int, 
                   content_type: str, successful: bool = True):
        """
        Learn from generated content
        
        Args:
            content: Generated content
            dna: Content DNA
            score: Quality score
            content_type: Type of content
            successful: Whether content was accepted
        """
        content_learner.learn_from_content(content, dna, score, content_type, successful)
        
    async def get_metrics(self) -> Dict:
        """Get performance metrics"""
        return content_learner.get_performance_metrics()