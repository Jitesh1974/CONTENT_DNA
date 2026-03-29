"""
Enterprise Test Script for Content DNA Engine
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_enterprise_generation():
    """Test enterprise content generation with long-form content"""
    
    # Sample: Long-form blog post
    sample_content = """
    Artificial Intelligence in Content Marketing: A Comprehensive Guide
    
    The digital marketing landscape has undergone a dramatic transformation over the past decade. Artificial intelligence has emerged as a game-changing force in how we create, distribute, and optimize content. This comprehensive guide explores the intersection of AI and content marketing.
    
    Understanding AI-Powered Content Creation
    Artificial intelligence has revolutionized content creation by enabling marketers to produce high-quality, relevant content at scale. From natural language processing to predictive analytics, AI tools are transforming how content strategies are developed and executed.
    
    Key Benefits of AI in Content Marketing
    1. Increased efficiency in content production
    2. Enhanced personalization capabilities
    3. Data-driven content optimization
    4. Improved ROI measurement
    5. Scalable content operations
    
    The Future of Content Marketing
    As AI continues to evolve, we're seeing the emergence of sophisticated multi-agent systems that can analyze, generate, and refine content autonomously. This represents a paradigm shift in how businesses approach content strategy.
    """
    
    print("="*60)
    print("ENTERPRISE CONTENT GENERATION TEST")
    print("="*60)
    
    payload = {
        "content": sample_content,
        "content_type": "blog_post",
        "topic_keywords": ["AI", "content marketing", "digital transformation", "automation"],
        "target_words": 1500
    }
    
    print("⏳ Generating comprehensive content (30-60 seconds)...")
    start_time = time.time()
    
    response = requests.post(f"{BASE_URL}/generate", json=payload, timeout=120)
    
    elapsed = time.time() - start_time
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n✅ Generation completed in {elapsed:.2f} seconds")
        print(f"\n📊 METRICS:")
        print(f"  Quality Score: {result['score']}/100")
        print(f"  SEO Score: {result.get('seo_score', 'N/A')}/100")
        print(f"  Word Count: {result['word_count']}")
        print(f"  Reading Time: {result['reading_time']} minutes")
        print(f"  Iterations: {result['iterations']}")
        
        print(f"\n🎯 DNA EXTRACTED:")
        dna = result['dna']
        print(f"  Tone: {dna['tone']}")
        print(f"  Keywords: {', '.join(dna['keywords'][:8])}")
        print(f"  Content Type: {dna['content_type']}")
        
        print(f"\n📝 GENERATED CONTENT (First 500 chars):")
        print("-"*60)
        print(result['final_content'][:500] + "...")
        print("-"*60)
        
        # Save to file
        with open("generated_content.txt", "w", encoding="utf-8") as f:
            f.write(result['final_content'])
        print(f"\n✅ Full content saved to generated_content.txt")
        
        return True
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)
        return False

def test_learning_metrics():
    """Test learning metrics endpoint"""
    print("\n" + "="*60)
    print("LEARNING METRICS")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/metrics")
    
    if response.status_code == 200:
        metrics = response.json()
        print(f"\n📊 Performance Metrics:")
        print(f"  Total Content: {metrics.get('total_content', 0)}")
        print(f"  Success Rate: {metrics.get('success_rate', 0)*100:.1f}%")
        print(f"  Average Score: {metrics.get('avg_score', 0):.1f}/100")
        print(f"  Best Score: {metrics.get('best_score', 0)}/100")
        print(f"  Average Word Count: {metrics.get('average_word_count', 0):.0f}")
        
        if metrics.get('top_keywords'):
            print(f"\n🏆 Top Performing Keywords:")
            for kw, count in list(metrics['top_keywords'].items())[:5]:
                print(f"  {kw}: {count} uses")
        
        return True
    else:
        print(f"❌ Error: {response.status_code}")
        return False

def test_recommendations():
    """Test recommendations endpoint"""
    print("\n" + "="*60)
    print("CONTENT RECOMMENDATIONS")
    print("="*60)
    
    content_type = "blog_post"
    topic_keywords = "AI,content marketing,automation"
    
    response = requests.get(f"{BASE_URL}/recommendations/{content_type}?topic_keywords={topic_keywords}")
    
    if response.status_code == 200:
        recs = response.json()
        print(f"\n💡 Recommendations for {content_type}:")
        print(f"  Suggested Tone: {recs.get('suggested_tone', 'N/A')}")
        print(f"  Suggested Keywords: {', '.join(recs.get('suggested_keywords', [])[:8])}")
        print(f"  Target Score: {recs.get('target_score', 85)}/100")
        
        if recs.get('insights'):
            print(f"\n  Insights:")
            for insight in recs['insights'][:3]:
                print(f"  • {insight}")
        
        return True
    else:
        print(f"❌ Error: {response.status_code}")
        return False

def test_batch_generation():
    """Test generating multiple pieces of content"""
    print("\n" + "="*60)
    print("BATCH CONTENT GENERATION")
    print("="*60)
    
    topics = [
        {"title": "AI in Healthcare", "keywords": ["AI", "healthcare", "innovation"]},
        {"title": "Future of Work", "keywords": ["remote work", "productivity", "culture"]},
        {"title": "Sustainable Tech", "keywords": ["sustainability", "green tech", "innovation"]}
    ]
    
    results = []
    
    for i, topic in enumerate(topics, 1):
        print(f"\n📝 Generating topic {i}/3: {topic['title']}")
        
        payload = {
            "content": f"Content about {topic['title']}",
            "content_type": "blog_post",
            "topic_keywords": topic['keywords'],
            "target_words": 800
        }
        
        response = requests.post(f"{BASE_URL}/generate", json=payload, timeout=90)
        
        if response.status_code == 200:
            result = response.json()
            results.append({
                "topic": topic['title'],
                "score": result['score'],
                "words": result['word_count'],
                "seo_score": result.get('seo_score', 0)
            })
            print(f"  ✅ Score: {result['score']}/100, Words: {result['word_count']}")
        else:
            print(f"  ❌ Failed")
        
        time.sleep(5)  # Delay between generations
    
    # Summary
    print(f"\n" + "="*60)
    print("BATCH SUMMARY")
    print("="*60)
    for result in results:
        print(f"  {result['topic']}: Score={result['score']}/100, SEO={result['seo_score']}/100, Words={result['words']}")
    
    avg_score = sum(r['score'] for r in results) / len(results) if results else 0
    print(f"\n  Average Score: {avg_score:.1f}/100")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "generate":
            test_enterprise_generation()
        elif sys.argv[1] == "metrics":
            test_learning_metrics()
        elif sys.argv[1] == "recommendations":
            test_recommendations()
        elif sys.argv[1] == "batch":
            test_batch_generation()
        elif sys.argv[1] == "all":
            test_recommendations()
            test_enterprise_generation()
            test_learning_metrics()
    else:
        print("Enterprise Content DNA Engine Test Suite")
        print("\nUsage:")
        print("  python test_enterprise.py generate      - Generate long-form content")
        print("  python test_enterprise.py metrics       - View learning metrics")
        print("  python test_enterprise.py recommendations - Get content recommendations")
        print("  python test_enterprise.py batch         - Batch generate multiple topics")
        print("  python test_enterprise.py all           - Run all tests")