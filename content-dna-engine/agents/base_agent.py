"""
Base agent class for all agents in the system
"""

from abc import ABC, abstractmethod
from typing import Any, Dict
from utils.logger import logger

class BaseAgent(ABC):
    """Abstract base class for all agents"""
    
    def __init__(self, name: str):
        self.name = name
        self.logger = logger
    
    @abstractmethod
    async def process(self, input_data: Any, context: Dict[str, Any] = None) -> Any:
        """Process input data and return result"""
        pass
    
    def log_start(self):
        """Log agent start"""
        self.logger.info(f"Starting {self.name}")
    
    def log_complete(self, result: Any = None):
        """Log agent completion"""
        self.logger.success(f"{self.name} completed")