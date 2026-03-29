"""
Custom logger with emoji-based logging for better visibility
"""

import logging
from typing import Optional

class EmojiLogger:
    """Logger with emoji prefixes for different operations"""
    
    def __init__(self, name: str = "ContentDNA"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        
        # Create console handler if not already present
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
    
    def analyzing(self, message: str):
        """Log analysis operations"""
        self.logger.info(f"🧠 {message}")
    
    def generating(self, message: str):
        """Log generation operations"""
        self.logger.info(f"✍️ {message}")
    
    def scoring(self, message: str):
        """Log scoring operations"""
        self.logger.info(f"📊 {message}")
    
    def refining(self, message: str):
        """Log refinement operations"""
        self.logger.info(f"🔁 {message}")
    
    def planning(self, message: str):
        """Log planning operations"""
        self.logger.info(f"📋 {message}")
    
    def criticizing(self, message: str):
        """Log criticism operations"""
        self.logger.info(f"🔍 {message}")
    
    def info(self, message: str):
        """Generic info logging"""
        self.logger.info(f"ℹ️ {message}")
    
    def error(self, message: str):
        """Error logging"""
        self.logger.error(f"❌ {message}")
    
    def success(self, message: str):
        """Success logging"""
        self.logger.info(f"✅ {message}")
    
    def warning(self, message: str):
        """Warning logging"""
        self.logger.warning(f"⚠️ {message}")

# Global logger instance
logger = EmojiLogger()