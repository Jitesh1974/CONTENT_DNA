"""
Multi-Platform Adapter - Adapts content for different platforms
"""

import re
from typing import Any, Dict, List
from agents.base_agent import BaseAgent

class MultiPlatformAdapter(BaseAgent):
    """Agent for adapting content across platforms"""
    
    def __init__(self):
        super().__init__("Multi-Platform Adapter")
    
    async def process(self, input_data: Any, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Adapt content for different platforms
        
        Args:
            input_data: Dictionary with content, brand_dna, and target platforms
            context: Additional context
            
        Returns:
            Platform-adapted versions
        """
        self.log_start()
        
        content = input_data.get("content", "")
        brand_dna = input_data.get("brand_dna", {})
        platforms = input_data.get("platforms", ["linkedin", "instagram", "blog"])
        
        adapted_versions = {}
        
        for platform in platforms:
            adapted = self._adapt_for_platform(content, brand_dna, platform)
            adapted_versions[platform] = adapted
        
        self.logger.success(f"Adapted content for {len(platforms)} platforms")
        self.log_complete()
        
        return {
            "original": content,
            "adaptations": adapted_versions,
            "platforms_adapted": platforms
        }
    
    def _adapt_for_platform(self, content: str, brand_dna: Dict, platform: str) -> str:
        """Adapt content for specific platform"""
        
        if platform == "linkedin":
            return self._adapt_for_linkedin(content, brand_dna)
        elif platform == "instagram":
            return self._adapt_for_instagram(content, brand_dna)
        elif platform in ["blog", "blog_post"]:
            return self._adapt_for_blog(content, brand_dna)
        elif platform == "twitter":
            return self._adapt_for_twitter(content, brand_dna)
        else:
            return content
    
    def _adapt_for_linkedin(self, content: str, brand_dna: Dict) -> str:
        """Adapt for LinkedIn (professional, 200-300 words)"""
        # Extract key message
        sentences = re.split(r'[.!?]+', content)
        key_message = sentences[0].strip() if sentences else content[:200]
        
        # Create LinkedIn version
        linkedin_content = []
        
        # Hook
        linkedin_content.append(key_message[:150])
        
        # Value proposition - get next sentence
        if len(sentences) > 1:
            linkedin_content.append(sentences[1].strip()[:200] if len(sentences[1]) > 0 else "")
        
        # Call to action
        linkedin_content.append("\n\nWhat are your thoughts on this? I'd love to hear your perspective in the comments! 👇")
        
        # Hashtags
        keywords = brand_dna.get("primary_keywords", ["AI", "innovation", "future"])[:4]
        hashtags = ' '.join([f"#{kw.replace(' ', '')}" for kw in keywords])
        linkedin_content.append(f"\n\n{hashtags}")
        
        return '\n'.join(linkedin_content)[:800]
    
    def _adapt_for_instagram(self, content: str, brand_dna: Dict) -> str:
        """Adapt for Instagram (casual, 100-150 words, emojis)"""
        # Extract first sentence as hook
        sentences = re.split(r'[.!?]+', content)
        hook = sentences[0].strip() if sentences else content[:50]
        
        # Add emojis based on brand style
        emoji_usage = brand_dna.get("emoji_usage", "occasional")
        emojis = {
            "none": [],
            "occasional": ["✨", "💡"],
            "moderate": ["✨", "💡", "🔥", "🙌"],
            "heavy": ["✨", "💡", "🔥", "🙌", "🎯", "💪", "🚀"]
        }
        
        selected_emojis = emojis.get(emoji_usage, ["✨", "💡"])
        
        instagram_content = []
        
        # Hook with emoji
        hook_emoji = selected_emojis[0] if selected_emojis else ""
        instagram_content.append(f"{hook_emoji} {hook}")
        
        # Key insight (next 2 sentences)
        key_insight = ' '.join(sentences[1:3]) if len(sentences) > 2 else sentences[1] if len(sentences) > 1 else ""
        if key_insight:
            instagram_content.append(f"\n{key_insight[:150]}")
        
        # CTA with emoji
        cta_emoji = selected_emojis[1] if len(selected_emojis) > 1 else '💬'
        instagram_content.append(f"\n{cta_emoji} What do you think? Let me know below!")
        
        # Hashtags
        keywords = brand_dna.get("primary_keywords", ["AI", "innovation", "future", "tech"])[:6]
        hashtags = '\n' + ' '.join([f"#{kw.replace(' ', '')}" for kw in keywords])
        instagram_content.append(hashtags)
        
        return '\n'.join(instagram_content)[:500]
    
    def _adapt_for_blog(self, content: str, brand_dna: Dict) -> str:
        """Adapt for Blog (structured, 800-1200 words)"""
        # Extract key sections
        sections = content.split('\n\n')
        
        blog_content = []
        
        # Title
        sentences = re.split(r'[.!?]+', content)
        title = sentences[0][:60] if sentences else "Understanding Content DNA"
        blog_content.append(f"# {title}\n")
        
        # Introduction
        intro = sections[1][:300] if len(sections) > 1 else sections[0][:300]
        blog_content.append(f"## Introduction\n\n{intro}\n")
        
        # Key points (extract from body)
        if len(sections) > 2:
            key_points = sections[2][:500]
            blog_content.append(f"## Key Insights\n\n{key_points}\n")
        else:
            # Extract middle sentences as body
            middle = ' '.join(sentences[2:5]) if len(sentences) > 4 else sentences[1] if len(sentences) > 1 else ""
            blog_content.append(f"## Key Insights\n\n{middle}\n")
        
        # Conclusion
        conclusion = sentences[-1][:200] if sentences else "Understanding and leveraging content DNA is crucial for brand consistency."
        blog_content.append(f"## Conclusion\n\n{conclusion}\n")
        
        # Call to action
        blog_content.append(f"---\n*Want to learn more about maintaining brand consistency? Subscribe to our newsletter for weekly insights.*")
        
        return '\n\n'.join(blog_content)[:3000]
    
    def _adapt_for_twitter(self, content: str, brand_dna: Dict) -> str:
        """Adapt for Twitter (280 characters)"""
        # Extract key message
        sentences = re.split(r'[.!?]+', content)
        key_message = sentences[0].strip() if sentences else content[:200]
        
        # Ensure length
        if len(key_message) > 260:
            key_message = key_message[:257] + "..."
        
        # Add hashtags
        keywords = brand_dna.get("primary_keywords", ["AI", "innovation"])[:2]
        hashtags = ' '.join([f"#{kw.replace(' ', '')}" for kw in keywords])
        
        return f"{key_message}\n\n{hashtags}"