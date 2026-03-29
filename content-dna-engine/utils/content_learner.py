"""
Content Learning System - Learns from previous content to improve future generations
"""

import json
import os
from typing import Dict, List, Any, Optional
from collections import defaultdict, Counter
from datetime import datetime
from utils.logger import logger

class ContentLearner:
    """Learns from historical content to improve generation quality"""
    
    def __init__(self, knowledge_base_path: str = "data/knowledge_base.json",
                 history_path: str = "data/content_history.json"):
        self.knowledge_base_path = knowledge_base_path
        self.history_path = history_path
        self.knowledge_base = self._load_knowledge_base()
        self.content_history = self._load_history()
        
    def _load_knowledge_base(self) -> Dict:
        """Load knowledge base from file"""
        if os.path.exists(self.knowledge_base_path):
            try:
                with open(self.knowledge_base_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # Ensure all required keys exist
                    if "successful_patterns" not in data:
                        data = self._initialize_knowledge_base()
                    return data
            except:
                return self._initialize_knowledge_base()
        return self._initialize_knowledge_base()
    
    def _initialize_knowledge_base(self) -> Dict:
        """Initialize empty knowledge base structure"""
        return {
            "successful_patterns": {
                "keywords": {},
                "tones": {},
                "structures": {},
                "sentence_lengths": [],
                "avg_scores": []
            },
            "failed_patterns": {
                "keywords": {},
                "tones": {},
                "structures": {}
            },
            "top_performers": [],
            "industry_insights": {},
            "seo_patterns": {}
        }
    
    def _load_history(self) -> List:
        """Load content history"""
        if os.path.exists(self.history_path):
            try:
                with open(self.history_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return []
        return []
    
    def _save_knowledge_base(self):
        """Save knowledge base to file"""
        os.makedirs(os.path.dirname(self.knowledge_base_path), exist_ok=True)
        with open(self.knowledge_base_path, 'w', encoding='utf-8') as f:
            json.dump(self.knowledge_base, f, indent=2, ensure_ascii=False)
    
    def _save_history(self):
        """Save content history"""
        os.makedirs(os.path.dirname(self.history_path), exist_ok=True)
        # Keep only last N entries
        if len(self.content_history) > 1000:
            self.content_history = self.content_history[-1000:]
        with open(self.history_path, 'w', encoding='utf-8') as f:
            json.dump(self.content_history, f, indent=2, ensure_ascii=False)
    
    def learn_from_content(self, content: str, dna: Dict, score: int, 
                          content_type: str, successful: bool = True):
        """
        Learn from generated content to improve future generations
        """
        logger.info(f"Learning from {'successful' if successful else 'failed'} content (Score: {score})")
        
        # Extract metrics
        word_count = len(content.split())
        headings = content.count('\n#') + content.count('\n##')
        
        # Store in history
        history_entry = {
            "timestamp": datetime.now().isoformat(),
            "content_type": content_type,
            "score": score,
            "successful": successful,
            "dna": dna,
            "metrics": {
                "word_count": word_count,
                "headings": headings,
                "keywords_used": dna.get("keywords", [])[:5]
            }
        }
        self.content_history.append(history_entry)
        
        if successful and score >= 80:
            # Learn from successful content
            for kw in dna.get("keywords", []):
                self.knowledge_base["successful_patterns"]["keywords"][kw] = \
                    self.knowledge_base["successful_patterns"]["keywords"].get(kw, 0) + 1
            
            tone = dna.get("tone", "professional")
            self.knowledge_base["successful_patterns"]["tones"][tone] = \
                self.knowledge_base["successful_patterns"]["tones"].get(tone, 0) + 1
            
            self.knowledge_base["successful_patterns"]["structures"][content_type] = \
                self.knowledge_base["successful_patterns"]["structures"].get(content_type, 0) + 1
            
            self.knowledge_base["successful_patterns"]["sentence_lengths"].append(dna.get("avg_sentence_length", 15))
            self.knowledge_base["successful_patterns"]["avg_scores"].append(score)
            
            # Track top performers
            self.knowledge_base["top_performers"].append({
                "score": score,
                "content_type": content_type,
                "keywords": dna.get("keywords", [])[:3],
                "timestamp": datetime.now().isoformat()
            })
            # Keep only top 50
            self.knowledge_base["top_performers"] = sorted(
                self.knowledge_base["top_performers"], 
                key=lambda x: x["score"], 
                reverse=True
            )[:50]
            
        elif not successful or score < 70:
            # Learn from failures
            for kw in dna.get("keywords", []):
                self.knowledge_base["failed_patterns"]["keywords"][kw] = \
                    self.knowledge_base["failed_patterns"]["keywords"].get(kw, 0) + 1
            
            tone = dna.get("tone", "professional")
            self.knowledge_base["failed_patterns"]["tones"][tone] = \
                self.knowledge_base["failed_patterns"]["tones"].get(tone, 0) + 1
            
            self.knowledge_base["failed_patterns"]["structures"][content_type] = \
                self.knowledge_base["failed_patterns"]["structures"].get(content_type, 0) + 1
        
        # Save updates
        self._save_history()
        self._save_knowledge_base()
    
    def get_recommendations(self, content_type: str, topic_keywords: List[str] = None) -> Dict:
        """
        Get recommendations based on learned patterns
        """
        recommendations = {
            "suggested_tone": "professional",
            "suggested_keywords": [],
            "suggested_structure": content_type,
            "target_score": 85,
            "insights": []
        }
        
        # Get best performing tone for this content type
        tones = self.knowledge_base["successful_patterns"]["tones"]
        if tones:
            best_tone = max(tones.items(), key=lambda x: x[1])[0]
            recommendations["suggested_tone"] = best_tone
        
        # Get successful keywords
        successful_keywords = self.knowledge_base["successful_patterns"]["keywords"]
        if successful_keywords:
            sorted_keywords = sorted(successful_keywords.items(), key=lambda x: x[1], reverse=True)
            top_keywords = [kw for kw, _ in sorted_keywords[:10]]
            recommendations["suggested_keywords"] = top_keywords
        
        # Add topic-specific keywords if provided
        if topic_keywords:
            recommendations["suggested_keywords"].extend(topic_keywords)
            recommendations["suggested_keywords"] = list(set(recommendations["suggested_keywords"]))[:15]
        
        # Calculate average successful score
        if self.knowledge_base["successful_patterns"]["avg_scores"]:
            avg_score = sum(self.knowledge_base["successful_patterns"]["avg_scores"]) / len(self.knowledge_base["successful_patterns"]["avg_scores"])
            recommendations["target_score"] = max(85, int(avg_score))
        
        # Add insights
        if len(self.content_history) > 10:
            recommendations["insights"].append(f"Based on {len(self.content_history)} historical contents")
        
        if self.content_history:
            successful_count = sum(1 for h in self.content_history if h["successful"])
            successful_rate = successful_count / len(self.content_history)
            recommendations["insights"].append(f"Historical success rate: {successful_rate:.1%}")
        
        # Add best performing keywords insight
        if successful_keywords:
            sorted_keywords = sorted(successful_keywords.items(), key=lambda x: x[1], reverse=True)
            top_3 = [kw for kw, _ in sorted_keywords[:3]]
            recommendations["insights"].append(f"Top performing keywords: {', '.join(top_3)}")
        
        return recommendations
    
    def get_performance_metrics(self) -> Dict:
        """Get overall performance metrics"""
        if not self.content_history:
            return {"message": "No historical data available", "total_content": 0}
        
        successful = [h for h in self.content_history if h["successful"]]
        failed = [h for h in self.content_history if not h["successful"]]
        
        # Calculate average word count
        avg_word_count = 0
        if self.content_history:
            avg_word_count = sum(h["metrics"]["word_count"] for h in self.content_history) / len(self.content_history)
        
        # Get top keywords
        successful_keywords = self.knowledge_base["successful_patterns"]["keywords"]
        top_keywords = dict(sorted(successful_keywords.items(), key=lambda x: x[1], reverse=True)[:10])
        
        metrics = {
            "total_content": len(self.content_history),
            "successful_count": len(successful),
            "failed_count": len(failed),
            "success_rate": len(successful) / max(1, len(self.content_history)),
            "avg_score": sum(h["score"] for h in self.content_history) / max(1, len(self.content_history)),
            "best_score": max([h["score"] for h in self.content_history]) if self.content_history else 0,
            "content_types": dict(Counter([h["content_type"] for h in self.content_history])),
            "average_word_count": avg_word_count,
            "top_keywords": top_keywords
        }
        
        return metrics

# Global learner instance
content_learner = ContentLearner()