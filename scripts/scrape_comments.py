import sys
import json
from scrapling import Fetcher

def scrape_comments(url):
    """
    Fetches the given URL and extracts comments using scrapling.
    Note: This is a placeholder implementation as YouTube comments are dynamic.
    """
    try:
        fetcher = Fetcher()
        page = fetcher.get(url)
        # Using the placeholder selector from the task description
        # Appending ::text to extract the text content
        comments = page.css('.comment-text-class::text').get_all()
        return comments
    except Exception as e:
        # In a real scenario, we might want to log this error
        return []

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
        results = scrape_comments(url)
        print(json.dumps(results))
    else:
        print(json.dumps([]))
