"""
Brand Consistency Checker - Validates content against brand DNA
"""

from typing import Any, Dict, List
from agents.base_agent import BaseAgent
from utils.text_processor import text_processor
import re

class ConsistencyChecker(BaseAgent):
    """Advanced agent for checking brand consistency"""
    
    def __init__(self):
        super().__init__("Consistency Checker")
    
    async def process(self, input_data: Any, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Check content consistency with brand DNA
        
        Args:
            input_data: Dictionary with content and brand_dna
            context: Additional context
            
        Returns:
            Consistency score and detailed feedback
        """
        self.log_start()
        
        content = input_data.get("content", "")
        brand_dna = input_data.get("brand_dna", {})
        platform = input_data.get("platform", "linkedin")
        
        # Check all consistency metrics
        checks = {
            "tone_match": self._check_tone_match(content, brand_dna),
            "keyword_alignment": self._check_keywords(content, brand_dna),
            "sentence_style": self._check_sentence_style(content, brand_dna),
            "emoji_consistency": self._check_emojis(content, brand_dna),
            "formality_match": self._check_formality(content, brand_dna),
            "storytelling_match": self._check_storytelling(content, brand_dna),
            "cta_presence": self._check_cta(content, brand_dna, platform),
            "structure_quality": self._check_structure(content, platform)
        }
        
        # Calculate overall score
        total_score = sum(checks.values())
        max_score = len(checks) * 100
        consistency_score = (total_score / max_score) * 100
        
        # Generate detailed feedback
        feedback = self._generate_feedback(checks, brand_dna, platform)
        
        # Determine if content needs refinement
        needs_refinement = consistency_score < 80
        
        self.logger.scoring(f"Consistency Score: {consistency_score:.1f}/100")
        
        if needs_refinement:
            self.logger.warning(f"Content needs refinement: {len(feedback)} issues found")
        
        self.log_complete()
        
        return {
            "consistency_score": round(consistency_score, 1),
            "detailed_scores": {k: v for k, v in checks.items()},
            "feedback": feedback,
            "needs_refinement": needs_refinement,
            "brand_match_percentage": round(consistency_score, 1)
        }
    
    def _check_tone_match(self, content: str, brand_dna: Dict) -> int:
        """Check tone match with brand DNA"""
        target_tone = brand_dna.get("tone", "professional")
        detected_tone = text_processor.detect_tone(content)
        
        if detected_tone == target_tone:
            return 100
        elif self._tone_compatible(detected_tone, target_tone):
            return 75
        else:
            return 50
    
    def _check_keywords(self, content: str, brand_dna: Dict) -> int:
        """Check keyword usage alignment"""
        target_keywords = set(brand_dna.get("primary_keywords", [])[:8])
        if not target_keywords:
            return 100
        
        content_lower = content.lower()
        matched = sum(1 for kw in target_keywords if kw.lower() in content_lower)
        
        return int((matched / len(target_keywords)) * 100)
    
    def _check_sentence_style(self, content: str, brand_dna: Dict) -> int:
        """Check sentence style consistency"""
        target_style = brand_dna.get("sentence_style", "medium_balanced")
        
        # Analyze current style
        sentences = re.split(r'[.!?]+', content)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if not sentences:
            return 50
        
        avg_length = sum(len(s.split()) for s in sentences) / len(sentences)
        
        if avg_length < 10:
            current_style = "short_punchy"
        elif avg_length < 18:
            current_style = "medium_balanced"
        else:
            current_style = "long_detailed"
        
        if current_style == target_style:
            return 100
        else:
            return 60
    
    def _check_emojis(self, content: str, brand_dna: Dict) -> int:
        """Check emoji usage consistency"""
        target_pattern = brand_dna.get("emoji_usage", "occasional")
        emoji_count = len(re.findall(r'[\U0001F600-\U0001F64F]', content))
        
        if target_pattern == "none" and emoji_count == 0:
            return 100
        elif target_pattern == "occasional" and 1 <= emoji_count <= 3:
            return 100
        elif target_pattern == "moderate" and 2 <= emoji_count <= 5:
            return 100
        elif target_pattern == "heavy" and emoji_count >= 3:
            return 100
        elif emoji_count == 0 and target_pattern != "none":
            return 50
        else:
            return 70
    
    def _check_formality(self, content: str, brand_dna: Dict) -> int:
        """Check formality level"""
        target_formality = brand_dna.get("formality_score", 0.5)
        
        formal_indicators = ["therefore", "hence", "thus", "pursuant", "whereas"]
        casual_indicators = ["lol", "omg", "hey", "guys", "cool"]
        
        formal_count = sum(1 for w in formal_indicators if w in content.lower())
        casual_count = sum(1 for w in casual_indicators if w in content.lower())
        
        total = formal_count + casual_count
        if total == 0:
            current_formality = 0.5
        else:
            current_formality = formal_count / total
        
        diff = abs(current_formality - target_formality)
        return max(0, 100 - int(diff * 100))
    
    def _check_storytelling(self, content: str, brand_dna: Dict) -> int:
        """Check storytelling alignment"""
        target_storytelling = brand_dna.get("storytelling_score", 0.5)
        
        storytelling_patterns = [
            r'\b(once|when|then|after|before|while)\b',
            r'\b(I|we) (realized|discovered|learned|found)\b'
        ]
        
        story_count = sum(len(re.findall(p, content, re.IGNORECASE)) for p in storytelling_patterns)
        current_storytelling = min(1.0, story_count / 10)
        
        diff = abs(current_storytelling - target_storytelling)
        return max(0, 100 - int(diff * 100))
    
    def _check_cta(self, content: str, brand_dna: Dict, platform: str) -> int:
        """Check call-to-action presence"""
        target_cta = brand_dna.get("cta_preference", "engagement")
        
        cta_patterns = {
            "action": r'\b(click|sign up|subscribe|download|register|buy)\b',
            "engagement": r'\b(share|comment|let us know|what do you think|your thoughts)\b',
            "connection": r'\b(contact|reach out|dm|connect|follow)\b'
        }
        
        for cta_type, pattern in cta_patterns.items():
            if re.search(pattern, content, re.IGNORECASE):
                if cta_type == target_cta:
                    return 100
                else:
                    return 75
        
        return 50 if platform in ["linkedin", "instagram", "email"] else 100
    
    def _check_structure(self, content: str, platform: str) -> int:
        """Check structural quality for platform"""
        if platform == "blog":
            has_headings = content.count('\n#') >= 2
            has_intro = len(content.split('\n\n')[0]) > 50 if '\n\n' in content else False
            if has_headings and has_intro:
                return 100
            elif has_headings or has_intro:
                return 75
            else:
                return 50
        elif platform == "linkedin":
            has_hook = len(content.split('\n')[0]) < 100 if '\n' in content else True
            has_question = '?' in content
            if has_hook and has_question:
                return 100
            elif has_hook or has_question:
                return 75
            else:
                return 60
        else:
            return 80
    
    def _tone_compatible(self, detected: str, target: str) -> bool:
        """Check if tones are compatible"""
        compatible_pairs = {
            ("professional", "formal"): True,
            ("formal", "professional"): True,
            ("casual", "friendly"): True,
            ("friendly", "casual"): True
        }
        return compatible_pairs.get((detected, target), False)
    
    def _generate_feedback(self, checks: Dict, brand_dna: Dict, platform: str) -> List[str]:
        """Generate actionable feedback"""
        feedback = []
        
        if checks.get("tone_match", 100) < 80:
            feedback.append(f"Tone should be more {brand_dna.get('tone', 'professional')}")
        
        if checks.get("keyword_alignment", 100) < 70:
            feedback.append("Incorporate more brand keywords naturally")
        
        if checks.get("sentence_style", 100) < 70:
            target_style = brand_dna.get("sentence_style", "medium_balanced")
            style_advice = {
                "short_punchy": "Use shorter, punchier sentences",
                "medium_balanced": "Mix short and medium-length sentences",
                "long_detailed": "Add more detailed, explanatory sentences"
            }
            feedback.append(style_advice.get(target_style, "Balance sentence lengths"))
        
        if checks.get("emoji_consistency", 100) < 70:
            pattern = brand_dna.get("emoji_usage", "occasional")
            if pattern == "none":
                feedback.append("Remove emojis for brand consistency")
            elif pattern == "occasional":
                feedback.append("Use 1-2 emojis strategically")
            elif pattern == "moderate":
                feedback.append("Add 2-4 emojis to match brand style")
        
        if checks.get("formality_match", 100) < 70:
            formality = brand_dna.get("formality_score", 0.5)
            if formality > 0.7:
                feedback.append("Use more formal language and professional terms")
            elif formality < 0.3:
                feedback.append("Make language more casual and conversational")
        
        if checks.get("cta_presence", 100) < 80:
            cta_type = brand_dna.get("cta_preference", "engagement")
            if cta_type == "action":
                feedback.append("Add a clear call-to-action (click, sign up, etc.)")
            elif cta_type == "engagement":
                feedback.append("End with a question to encourage engagement")
            elif cta_type == "connection":
                feedback.append("Include invitation to connect or reach out")
        
        if platform == "blog" and checks.get("structure_quality", 100) < 80:
            feedback.append("Add more headings to improve structure")
        
        return feedback[:6]  # Limit to 6 feedback items