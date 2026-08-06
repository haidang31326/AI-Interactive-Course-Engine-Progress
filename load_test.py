import urllib.request
import concurrent.futures
import time

URL = "http://localhost:8080/api/courses/community"
TOTAL_REQUESTS = 500
CONCURRENCY = 20

def fetch_url(url):
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.status
    except Exception as e:
        return str(e)

print(f"Starting Load Test on {URL}")
print(f"Total Requests: {TOTAL_REQUESTS}")
print(f"Concurrency: {CONCURRENCY}")

start_time = time.time()
success = 0
failed = 0

with concurrent.futures.ThreadPoolExecutor(max_workers=CONCURRENCY) as executor:
    futures = [executor.submit(fetch_url, URL) for _ in range(TOTAL_REQUESTS)]
    for future in concurrent.futures.as_completed(futures):
        status = future.result()
        if status == 200:
            success += 1
        else:
            failed += 1

end_time = time.time()
duration = end_time - start_time
rps = TOTAL_REQUESTS / duration

print("-" * 30)
print("Load Test Results:")
print(f"Time taken: {duration:.2f} seconds")
print(f"Successful requests: {success}")
print(f"Failed requests: {failed}")
print(f"Requests per second (RPS): {rps:.2f}")
