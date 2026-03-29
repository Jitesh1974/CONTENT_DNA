"""
Advanced Content Generator - Creates high-scoring, brand-aligned content
"""

import re
from typing import Any, Dict, List
from agents.base_agent import BaseAgent
from utils.llm_client import llm_client
from backend.config import Config

class ContentGenerator(BaseAgent):
    """Advanced generator for high-quality, brand-consistent content"""
    
    def __init__(self):
        super().__init__("Content Generator")
        self.quality_target = 90  # Target score
    
    async def process(self, input_data: Any, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Generate high-quality content aligned with brand DNA
        
        Args:
            input_data: Dictionary with brand_dna, content_type, topic
            context: Additional context
            
        Returns:
            Generated content with metadata
        """
        self.log_start()
        
        brand_dna = input_data.get("brand_dna", {})
        content_type = input_data.get("content_type", "linkedin")
        topic = input_data.get("topic", "")
        platform = input_data.get("platform", content_type)
        
        # Build ultra-optimized prompt
        prompt = self._build_winning_prompt(brand_dna, platform, topic)
        
        self.logger.generating(f"Creating {platform} content with target score {self.quality_target}...")
        
        # Generate content with optimization
        generated_content = await llm_client.call_llm(prompt)
        
        # Post-process for quality
        generated_content = self._optimize_content(generated_content, brand_dna, platform)
        
        # Calculate initial score
        initial_score = self._calculate_content_score(generated_content, brand_dna, platform)
        
        self.logger.success(f"Generated content with score: {initial_score}/100")
        self.log_complete()
        
        return {
            "content": generated_content,
            "brand_dna": brand_dna,
            "platform": platform,
            "initial_score": initial_score,
            "word_count": len(generated_content.split())
        }
    
    def _build_winning_prompt(self, brand_dna: Dict, platform: str, topic: str) -> str:
        """Build high-quality prompt that maximizes scores"""
        
        # Platform-specific optimizations
        platform_instructions = {
            "linkedin": """
Create a professional LinkedIn post that:
- Starts with a strong hook (question or statement)
- Shares valuable insights or lessons learned
- Uses 1-2 relevant emojis max
- Ends with a question to drive engagement
- Includes 3-5 relevant hashtags
- Word count: 200-300 words
- Tone: {tone_description}
""",
            "instagram": """
Create an engaging Instagram caption that:
- Opens with an attention-grabbing hook
- Uses 2-3 relevant emojis strategically
- Includes a personal touch or story
- Ends with a call-to-action (question or prompt)
- Has 5-8 relevant hashtags
- Word count: 100-150 words
- Tone: {tone_description}
""",
            "blog": """
Create a comprehensive blog post that:
- Has a compelling title with keywords
- Opens with a strong hook addressing reader's pain point
- Uses H2 and H3 subheadings for structure
- Includes actionable tips and examples
- Has a clear conclusion with key takeaways
- Ends with a call-to-action
- Word count: 800-1200 words
- Tone: {tone_description}
""",
            "blog_post": """
Create a comprehensive blog post that:
- Has a compelling title with keywords
- Opens with a strong hook addressing reader's pain point
- Uses H2 and H3 subheadings for structure
- Includes actionable tips and examples
- Has a clear conclusion with key takeaways
- Ends with a call-to-action
- Word count: 800-1200 words
- Tone: {tone_description}
""",
            "email": """
Create a professional email that:
- Has a clear subject line
- Opens with a personalized greeting
- Clearly states the purpose in first paragraph
- Uses bullet points for key information
- Ends with a clear call-to-action
- Includes a professional signature
- Word count: 150-250 words
- Tone: {tone_description}
"""
        }
        
        # Tone descriptions for better alignment
        tone_descriptions = {
            "formal": "formal and authoritative, using sophisticated language and structured arguments",
            "professional": "professional and polished, using business-appropriate language with confidence",
            "friendly": "friendly and approachable, using conversational language that builds connection",
            "casual": "casual and relatable, using everyday language and personal stories",
            "humorous": "humorous and engaging, using wit and relatable observations"
        }
        
        tone = brand_dna.get("tone", "professional")
        if isinstance(tone, str):
            tone = tone.lower()
        tone_desc = tone_descriptions.get(tone, "professional and engaging")
        
        instructions = platform_instructions.get(platform, platform_instructions["linkedin"])
        instructions = instructions.replace("{tone_description}", tone_desc)
        
        # Keywords optimization
        keywords = brand_dna.get("primary_keywords", [])
        keyword_section = "\nKey keywords to naturally incorporate:\n"
        if keywords:
            keyword_section += ", ".join(keywords[:8])
        else:
            keyword_section += "AI, innovation, content, transformation, future"
        
        # Style optimization
        style_section = f"""
Style guidelines:
- Average sentence length: {brand_dna.get('sentence_length_avg', 15)} words
- Emoji usage: {brand_dna.get('emoji_usage', 'occasional')}
- Formality level: {brand_dna.get('formality_score', 0.5):.0%}
- Include storytelling elements: {brand_dna.get('storytelling_score', 0.5):.0%}
"""
        
        prompt = f"""{instructions}

{keyword_section}

{style_section}

Topic: {topic if topic else 'Share insights about AI and content creation'}

Create the content now. Make it engaging, valuable, and perfectly aligned with the brand voice.
Make sure it ends properly and includes all required elements.

Content:"""
        
        return prompt
    
    def _optimize_content(self, content: str, brand_dna: Dict, platform: str) -> str:
        """Optimize content for maximum score"""
        
        # Remove any "Content:" prefix
        if content.startswith("Content:"):
            content = content[8:].strip()
        
        # Ensure proper formatting
        lines = content.split('\n')
        optimized_lines = []
        
        for i, line in enumerate(lines):
            line = line.strip()
            
            # Ensure proper heading format for blog
            if platform in ["blog", "blog_post"] and i == 0 and not line.startswith('#'):
                if len(line) < 80 and ':' not in line:
                    optimized_lines.append(f"# {line}")
                else:
                    optimized_lines.append(line)
            else:
                optimized_lines.append(line)
        
        content = '\n'.join(optimized_lines)
        
        # Ensure hashtags for social media
        if platform in ["linkedin", "instagram"] and '#' not in content:
            keywords = brand_dna.get("primary_keywords", ["AI", "innovation", "future"])[:4]
            hashtags = ' '.join([f"#{kw.replace(' ', '')}" for kw in keywords if kw])
            if hashtags:
                content = f"{content}\n\n{hashtags}"
        
        # Ensure CTA for marketing content
        if platform in ["linkedin", "email", "instagram"] and not self._has_cta(content):
            ctas = {
                "linkedin": "\n\nWhat are your thoughts on this? Drop them in the comments! 👇",
                "email": "\n\nBest regards,\nThe Team",
                "instagram": "\n\nWhat do you think? Let me know in the comments! 💬"
            }
            content += ctas.get(platform, "")
        
        # Ensure emoji count matches brand preference
        emoji_usage = brand_dna.get("emoji_usage", "occasional")
        emoji_count = len(re.findall(r'[\U0001F600-\U0001F64F]', content))
        
        if emoji_usage == "none" and emoji_count > 0:
            content = re.sub(r'[\U0001F600-\U0001F64F]', '', content)
        elif emoji_usage == "occasional" and emoji_count > 3:
            # Keep only first 2 emojis
            emojis = re.findall(r'[\U0001F600-\U0001F64F]', content)
            for emoji in emojis[2:]:
                content = content.replace(emoji, '', 1)
        
        return content.strip()
    
    def _calculate_content_score(self, content: str, brand_dna: Dict, platform: str) -> int:
        """Calculate initial content quality score"""
        score = 75  # Base score
        
        # Length score (10 points)
        words = len(content.split())
        target_words = {"linkedin": 250, "instagram": 125, "blog": 1000, "blog_post": 1000, "email": 200}
        target = target_words.get(platform, 250)
        if words >= target * 0.8 and words <= target * 1.5:
            score += 10
        elif words >= target * 0.6:
            score += 5
        
        # Keywords usage (10 points)
        keywords = set(brand_dna.get("primary_keywords", [])[:5])
        content_lower = content.lower()
        if keywords:
            keyword_matches = sum(1 for kw in keywords if kw.lower() in content_lower)
            score += int((keyword_matches / len(keywords)) * 10)
        
        # Structure score (10 points)
        if platform in ["blog", "blog_post"] and content.count('\n#') >= 2:
            score += 10
        elif platform in ["linkedin", "instagram"] and '?' in content:
            score += 10
        elif platform == "email" and 'Subject:' in content[:100]:
            score += 10
        
        # Engagement score (10 points)
        if platform in ["linkedin", "instagram"] and '?' in content:
            score += 5
        if '#' in content:
            score += 5
        
        return min(100, score)
    
    def _has_cta(self, content: str) -> bool:
        """Check for call-to-action"""
        cta_patterns = [
            r'\b(click|sign up|subscribe|follow|contact|visit|learn more|get started)\b',
            r'\b(share your|let us know|comment below|reach out|dm us|what are your thoughts)\b'
        ]
        return any(re.search(p, content, re.IGNORECASE) for p in cta_patterns)