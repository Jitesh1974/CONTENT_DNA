"""
Refiner Agent - Improves content based on critic feedback
"""

from typing import Any, Dict, List
from agents.base_agent import BaseAgent
from utils.llm_client import llm_client

class RefinerAgent(BaseAgent):
    """Agent responsible for refining content based on feedback"""
    
    def __init__(self):
        super().__init__("Refiner Agent")
    
    async def process(self, input_data: Any, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Refine content based on critic feedback
        
        Args:
            input_data: Dictionary with content, DNA, and feedback
            context: Additional context
            
        Returns:
            Dictionary with refined content
        """
        self.log_start()
        
        content = input_data.get("content", "")
        dna = input_data.get("dna", {})
        feedback = input_data.get("feedback", [])
        scores = input_data.get("scores", {})
        content_type = input_data.get("content_type", "linkedin")
        
        if not feedback:
            self.logger.info("No refinement needed")
            return {"content": content, "refined": False}
        
        # Build refinement prompt
        prompt = self._build_refinement_prompt(content, dna, feedback, scores, content_type)
        
        self.logger.refining(f"Refining based on {len(feedback)} points...")
        
        # Generate refined content
        refined_content = await llm_client.call_llm(prompt)
        
        # Clean up
        refined_content = refined_content.strip()
        if refined_content and refined_content[-1] not in '.!?':
            refined_content += '.'
        
        self.log_complete()
        
        return {
            "content": refined_content,
            "refined": True,
            "original_feedback": feedback
        }
    
    def _build_refinement_prompt(self, content: str, dna: Dict[str, Any], 
                                  feedback: List[str], scores: Dict[str, Any],
                                  content_type: str) -> str:
        """Build refinement prompt based on feedback"""
        
        feedback_text = "\n".join([f"- {f}" for f in feedback])
        
        tone_guidance = {
            "casual": "Make it more casual and friendly",
            "professional": "Make it more professional and polished",
            "formal": "Make it more formal and structured"
        }
        
        prompt = f"""Improve this content based on the following feedback:

Original Content:
{content}

Feedback to address:
{feedback_text}

Current scores:
- Sentence Length: {scores.get('sentence_length', 0)}/25
- Keyword Usage: {scores.get('keyword_usage', 0)}/25
- Tone Match: {scores.get('tone_match', 0)}/25
- Emoji Control: {scores.get('emoji_control', 0)}/25

Target tone: {dna.get('tone', 'professional')} - {tone_guidance.get(dna.get('tone', 'professional'), 'Maintain professional tone')}
Target keywords: {', '.join(dna.get('keywords', [])[:5])}
Platform: {content_type}

Generate only the improved content, no explanations:"""
        
        return prompt