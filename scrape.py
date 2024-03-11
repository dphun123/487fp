from icrawler.builtin import BingImageCrawler, GoogleImageCrawler

KEYWORDS = ["bread slice", "potato vegetable", "ground beef raw", "banana", "green onion"]
LABELS = ["bread", "potato", "ground beef", "banana", "green onion"]
LIMIT = 10000

def download_images(keyword, label, limit):
    # bing_crawler = BingImageCrawler(feeder_threads=1,
    #                                     parser_threads=2,
    #                                     downloader_threads=4,
    #                                     storage={'root_dir': f'./project/images/{label}'})
    # bing_crawler.crawl(keyword=keyword, max_num=limit)
    google_crawler = GoogleImageCrawler(feeder_threads=1,
                                        parser_threads=2,
                                        downloader_threads=4,
                                        storage={'root_dir': f'./project/images2/{label}'})
    google_crawler.crawl(keyword=keyword, max_num=limit)

for i in range(len(KEYWORDS)):
    download_images(KEYWORDS[i], LABELS[i], LIMIT)
