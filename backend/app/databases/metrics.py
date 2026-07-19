from prometheus_client import Gauge, Counter
from app.databases.connections import db_pool

# Metric Definitions
DB_CONN_GAUGE = Gauge("postgres_active_connections", "Current active sessions inside PostgreSQL")
CACHE_HIT_COUNTER = Counter("cache_hits_total", "Total successful Redis cache lookups")
CACHE_MISS_COUNTER = Counter("cache_misses_total", "Total Redis cache misses requiring DB query")

def track_db_metrics():
    if not db_pool:
        return 0
    conn = None
    try:
        conn = db_pool.getconn()
        with conn.cursor() as cursor:
            cursor.execute("SELECT count(*) FROM pg_stat_activity;")
            count = cursor.fetchone()[0]
            DB_CONN_GAUGE.set(count)
            return count
    except Exception:
        return 0
    finally:
        if conn:
            db_pool.putconn(conn)