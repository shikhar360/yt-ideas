import sys
import json
import itertools
from youtube_comment_downloader import YoutubeCommentDownloader

def scrape_comments(url, limit=50):
    """
    Fetches the given URL and extracts comments using youtube-comment-downloader.
    """
    try:
        downloader = YoutubeCommentDownloader()
        comments_iter = downloader.get_comments_from_url(url, sort_by=0) # 0 for newest
        # Slice the generator to avoid infinite or too many comments
        comments = list(itertools.islice(comments_iter, limit))
        # Extract only the text from the comment objects
        return [comment['text'] for comment in comments]
    except Exception as e:
        return []

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
        results = scrape_comments(url)
        print(json.dumps(results))
    else:
        print(json.dumps([]))
