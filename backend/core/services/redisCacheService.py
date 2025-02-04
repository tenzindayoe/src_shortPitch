import redis



def cache_data(key, data):
    # Connect to the Redis server
    r = redis.Redis(host='localhost', port=6379, db=0)
    r.set(key, data)
    print("Data cached successfully")


def get_cached_data(key):
    # Connect to the Redis server
    if key is None:
        return None
    
    r = redis.Redis(host='localhost', port=6379, db=0)
    if r.exists(key):
        print("Data retrieved successfully")
        return r.get(key)

    else:

        return None
