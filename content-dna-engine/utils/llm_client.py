"""
LLM client for Ollama integration
"""

import httpx
import json
from typing import Optional, Dict, Any
from utils.logger import logger
from backend.config import Config

class LLMClient:
    """Client for interacting with Ollama API"""
    
    def __init__(self):
        self.base_url = Config.OLLAMA_BASE_URL
        self.default_model = Config.DEFAULT_MODEL
        self.fallback_model = Config.FALLBACK_MODEL
        self.timeout = Config.LLM_TIMEOUT
        self.max_tokens = Config.MAX_TOKENS
    
    async def call_llm(self, prompt: str, model: Optional[str] = None) -> str:
        """
        Call Ollama LLM with the given prompt
        
        Args:
            prompt: The prompt to send to the LLM
            model: Model to use (defaults to mistral)
            
        Returns:
            Generated text response
        """
        model = model or self.default_model
        
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": self.max_tokens,
                "temperature": 0.7,
                "top_p": 0.9,
                "stop": ["\n\n\n"]  # Stop at triple newlines
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                logger.info(f"Calling Ollama with model: {model}")
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload
                )
                
                logger.info(f"Ollama response status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    generated_text = result.get("response", "").strip()
                    if generated_text:
                        logger.success(f"LLM generated {len(generated_text)} characters")
                        return generated_text
                    else:
                        logger.warning("Empty response from Ollama")
                        return self._generate_fallback_response(prompt)
                else:
                    logger.error(f"Ollama error: {response.status_code}")
                    logger.error(f"Response: {response.text[:200]}")
                    return await self._fallback_call(prompt)
                    
        except httpx.TimeoutException:
            logger.error(f"Ollama timeout after {self.timeout} seconds")
            return await self._fallback_call(prompt)
        except httpx.ConnectError:
            logger.error(f"Cannot connect to Ollama at {self.base_url}")
            logger.info("Make sure Ollama is running: 'ollama serve'")
            return self._generate_fallback_response(prompt)
        except Exception as e:
            logger.error(f"LLM call failed: {str(e)}")
            return self._generate_fallback_response(prompt)
    
    async def _fallback_call(self, prompt: str) -> str:
        """Try fallback model if primary fails"""
        try:
            logger.info(f"Trying fallback model: {self.fallback_model}")
            payload = {
                "model": self.fallback_model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "num_predict": self.max_tokens,
                    "temperature": 0.7
                }
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload
                )
                
                if response.status_code == 200:
                    result = response.json()
                    generated_text = result.get("response", "").strip()
                    if generated_text:
                        return generated_text
                
                return self._generate_fallback_response(prompt)
                    
        except Exception as e:
            logger.error(f"Fallback LLM call failed: {e}")
            return self._generate_fallback_response(prompt)
    
    def _generate_fallback_response(self, prompt: str) -> str:
        """Generate a contextual fallback response when LLM is unavailable"""
        logger.warning("Using fallback response generator")
        
        # Extract keywords from prompt
        keywords = []
        if "Key themes to include:" in prompt:
            kw_section = prompt.split("Key themes to include:")[1].split("\n")[0]
            keywords = [k.strip() for k in kw_section.split(",")[:3]]
        
        # Extract topic
        topic = "AI and content creation"
        if "Topic:" in prompt:
            try:
                topic_line = prompt.split("Topic:")[1].split("\n")[0]
                topic = topic_line.strip()
            except:
                pass
        
        if "instagram" in prompt.lower():
            return f"""✨ {topic} Magic! ✨

Just discovered how AI is transforming {topic.lower()}!

{keywords[0] if keywords else 'Content'} is evolving, and we're here for it! 

What's your favorite way to create content? Drop it below! 👇

#ContentCreation #AI #Innovation #CreativeProcess"""
        
        elif "linkedin" in prompt.lower():
            return f"""I've been exploring how {keywords[0] if keywords else 'AI'} is transforming {topic.lower()}.

Key insights from my journey:
• {keywords[0] if keywords else 'AI'} tools are game-changers for content creators
• Quality content at scale is now possible with the right approach
• The future of content is collaborative between humans and AI

What's your experience with AI in content creation? Share your thoughts below! 👇

#ContentStrategy #AI #Innovation #DigitalMarketing"""
        
        else:  # blog post or article
            return f"""# {topic}

## Introduction
The landscape of content creation is undergoing a remarkable transformation. {topic} has emerged as a powerful force in how we create, optimize, and distribute content.

## Key Benefits
1. **Increased Efficiency**: AI tools help creators produce more in less time
2. **Enhanced Quality**: Intelligent systems suggest improvements and optimizations
3. **Better Insights**: Data-driven approaches to content strategy

## Best Practices
- Start with clear goals and audience understanding
- Leverage AI for research and ideation
- Maintain human oversight for quality and authenticity
- Iterate and improve based on performance data

## Future Outlook
As technology continues to evolve, we can expect even more sophisticated tools that will further empower content creators to produce exceptional work.

---
*This content was generated by Content DNA Engine - Your AI-powered content assistant*

⏱️ Reading time: 3 minute(s)"""

# Global LLM client instance
llm_client = LLMClient()