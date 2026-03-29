# test_ollama.py
import requests
import json

def test_ollama():
    """Test Ollama connection"""
    print("Testing Ollama connection...")
    
    # Test if Ollama is running
    try:
        response = requests.get("http://localhost:11434/api/tags")
        if response.status_code == 200:
            models = response.json()
            print("✅ Ollama is running")
            print(f"Available models: {[m['name'] for m in models.get('models', [])]}")
        else:
            print(f"❌ Ollama returned status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to Ollama: {e}")
        print("Make sure Ollama is running: 'ollama serve'")
        return False
    
    # Test generation
    print("\nTesting generation with mistral...")
    payload = {
        "model": "mistral",
        "prompt": "Write a short sentence about AI.",
        "stream": False,
        "options": {"num_predict": 50}
    }
    
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Generation successful!")
            print(f"Response: {result.get('response', '')}")
            return True
        else:
            print(f"❌ Generation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Generation error: {e}")
        return False

if __name__ == "__main__":
    test_ollama()