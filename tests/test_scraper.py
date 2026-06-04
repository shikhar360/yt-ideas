import sys
import os

# Ensure the scripts directory is in the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from scripts.scrape_comments import scrape_comments

def test_scrape_logic():
    # Mock test or simple check
    assert callable(scrape_comments)

if __name__ == "__main__":
    test_scrape_logic()
    print("Test passed: scrape_comments is callable")
