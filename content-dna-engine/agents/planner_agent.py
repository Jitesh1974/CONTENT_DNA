"""
Planner Agent - Determines strategy and orchestrates the workflow
"""

from typing import Any, Dict
from agents.base_agent import BaseAgent
from utils.text_processor import text_processor

class PlannerAgent(BaseAgent):
    """Agent responsible for planning the content generation strategy"""
    
    def __init__(self):
        super().__init__("Planner Agent")
    
    async def process(self, input_data: Any, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Plan the content generation strategy
        
        Args:
            input_data: The content to analyze
            context: Additional context (if any)
            
        Returns:
            Dictionary with planning information
        """
        self.log_start()
        
        content = input_data if isinstance(input_data, str) else input_data.get("content", "")
        
        # Detect content type
        content_type = text_processor.detect_content_type(content)
        
        # Determine strategy based on content type
        strategies = {
            "blog": {
                "structure": "structured",
                "tone_preference": "professional",
                "max_emojis": 0,
                "min_words": 300
            },
            "linkedin": {
                "structure": "professional",
                "tone_preference": "professional",
                "max_emojis": 1,
                "min_words": 100
            },
            "instagram": {
                "structure": "short",
                "tone_preference": "casual",
                "max_emojis": 2,
                "min_words": 30
            }
        }
        
        strategy = strategies.get(content_type, strategies["linkedin"])
        
        plan = {
            "content_type": content_type,
            "strategy": strategy,
            "requires_chunking": len(content.split()) > 150,
            "estimated_iterations": 1
        }
        
        self.logger.planning(f"Strategy: {content_type} - {strategy['structure']} tone")
        self.log_complete()
        
        return plan