import requests
import concurrent.futures
import time

BASE_URL = "http://localhost:8080/api"

# We assume course ID 1 exists for cloning test. If not, this will return 404/500
COURSE_ID_TO_CLONE = 1
NEW_USER_ID = 2

def test_gemini_rate_limit(request_id):
    """
    Test Gemini API limits by calling the explain endpoint.
    This simulates multiple users highlighting text and asking AI at the same time.
    """
    url = f"{BASE_URL}/chat/explain"
    payload = {
        "highlightedText": "What is Python?",
        "question": f"Explain this to me simply. Request {request_id}"
    }
    start_time = time.time()
    try:
        response = requests.post(url, json=payload, timeout=30)
        elapsed = time.time() - start_time
        if response.status_code == 200:
            return (True, response.status_code, elapsed)
        else:
            return (False, response.status_code, elapsed)
    except Exception as e:
        return (False, str(e), time.time() - start_time)

def test_course_clone(request_id):
    """
    Test DB transaction limits and deadlocks by cloning courses concurrently.
    """
    url = f"{BASE_URL}/courses/{COURSE_ID_TO_CLONE}/clone?newUserId={NEW_USER_ID}"
    start_time = time.time()
    try:
        response = requests.post(url, timeout=30)
        elapsed = time.time() - start_time
        if response.status_code == 200:
            return (True, response.status_code, elapsed)
        else:
            return (False, response.status_code, elapsed)
    except Exception as e:
        return (False, str(e), time.time() - start_time)


def run_gemini_test(concurrent_users=15):
    print(f"\n--- 🚀 RUNNING GEMINI RATE LIMIT TEST ({concurrent_users} Concurrent Users) ---")
    success_count = 0
    fail_count = 0
    times = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrent_users) as executor:
        futures = [executor.submit(test_gemini_rate_limit, i) for i in range(concurrent_users)]
        for future in concurrent.futures.as_completed(futures):
            success, status, elapsed = future.result()
            times.append(elapsed)
            if success:
                success_count += 1
            else:
                fail_count += 1
                # print(f"Failed with status: {status}")

    avg_time = sum(times) / len(times) if times else 0
    print(f"Results: {success_count} Success | {fail_count} Failed")
    print(f"Average Response Time: {avg_time:.2f}s")


def run_clone_test(concurrent_users=50):
    print(f"\n--- 🚀 RUNNING COURSE CLONE DB DEADLOCK TEST ({concurrent_users} Concurrent Users) ---")
    success_count = 0
    fail_count = 0
    times = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrent_users) as executor:
        futures = [executor.submit(test_course_clone, i) for i in range(concurrent_users)]
        for future in concurrent.futures.as_completed(futures):
            success, status, elapsed = future.result()
            times.append(elapsed)
            if success:
                success_count += 1
            else:
                fail_count += 1
                
    avg_time = sum(times) / len(times) if times else 0
    print(f"Results: {success_count} Success | {fail_count} Failed")
    print(f"Average Response Time: {avg_time:.2f}s")


if __name__ == "__main__":
    print("Initializing Advanced Load Tests...")
    # 1. Test Database Deadlock first (Fast)
    run_clone_test(50)
    
    # 2. Test Gemini API (Slower, rate limited)
    run_gemini_test(15)
    
    print("\n--- 🏁 TEST COMPLETE ---")
