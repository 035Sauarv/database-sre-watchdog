import os
import psycopg2
from psycopg2.pool import SimpleConnectionPool
import redis

# Corrected the password fallback to 'srepassword' matching your docker-compose config
DB_URL = os.getenv("DATABASE_URL", "postgresql://sreadmin:srepassword@sre_target_db:5432/sredb")
REDIS_URL = os.getenv("REDIS_URL", "redis://sre_guardrail_cache:6379/0")

try:
    db_pool = SimpleConnectionPool(1, 20, dsn=DB_URL)
    cache = redis.Redis.from_url(REDIS_URL, decode_responses=True)
except Exception as e:
    print(f"Database/Cache Init Error: {e}")
    db_pool = None
    cache = None