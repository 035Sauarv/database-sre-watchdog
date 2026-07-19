import json
from fastapi import APIRouter, HTTPException,Depends
from pydantic import BaseModel
from psycopg2.extras import RealDictCursor
from app.databases.connections import db_pool, cache
from app.databases.metrics import track_db_metrics, CACHE_HIT_COUNTER, CACHE_MISS_COUNTER
from security import verify_role

router = APIRouter()

class TaskSchema(BaseModel):
    title: str

@router.get("/telemetry")
def get_system_telemetry():
    active_conns = track_db_metrics()
    db_status = "HEALTHY" if db_pool else "OFFLINE"
    
    try:
        cache.ping()
        cache_status = "CONNECTED"
    except Exception:
        cache_status = "OFFLINE"
        
    return {
        "database_status": db_status,
        "active_connections": active_conns,
        "cache_layer": cache_status
    }

@router.post("/tasks")
async def create_task(task: dict,role:str = Depends(verify_role)):
    if not db_pool:
        raise HTTPException(status_code=500, detail="Database connection pool unavailable")
    conn = None
    try:
        conn = db_pool.getconn()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                "INSERT INTO tasks (title) VALUES (%s) RETURNING id, title, completed;",
                (task.title,)
            )
            new_task = cursor.fetchone()
            conn.commit()
            if cache:
                cache.delete("dashboard:tasks")
            return new_task
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn: db_pool.putconn(conn)
    
    return {"message": "Task successfully written to the Main Vault"}

@router.get("/tasks")
def list_tasks():
    if cache:
        try:
            cached_tasks = cache.get("dashboard:tasks")
            if cached_tasks:
                CACHE_HIT_COUNTER.inc()
                return json.loads(cached_tasks)
        except Exception:
            pass

    CACHE_MISS_COUNTER.inc()
    if not db_pool:
        raise HTTPException(status_code=500, detail="Database connection pool unavailable")
    conn = None
    try:
        conn = db_pool.getconn()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT id, title, completed FROM tasks ORDER BY id DESC;")
            tasks = cursor.fetchall()
            if cache:
                cache.setex("dashboard:tasks", 60, json.dumps(tasks))
            return tasks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn: db_pool.putconn(conn)




@router.put("/tasks/{task_id}/complete")
async def complete_task(task_id: int,role:str=Depends(lambda r:verify_role(r,"Operator"))):
    """Marks a specific operational task as completed in the database."""
    if not db_pool:
        raise HTTPException(status_code=500, detail="Database connection pool unavailable")
    conn = None
    try:
        conn = db_pool.getconn()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                "UPDATE tasks SET completed = TRUE WHERE id = %s RETURNING id, title, completed;",
                (task_id,)
            )
            updated_task = cursor.fetchone()
            if not updated_task:
                raise HTTPException(status_code=404, detail="Task not found")
            conn.commit()
            
            # Wipe cache so changes reflect instantly
            if cache:
                cache.delete("dashboard:tasks")
            return updated_task
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn: db_pool.putconn(conn)
    return {"message": "Task status updated successfully"}

@router.delete("/tasks/{task_id}")
def delete_task(task_id: int,role:str=Depends(lambda r:verify_role(r,"Admin"))):
    """Permanently drops a task row out of the database."""
    if not db_pool:
        raise HTTPException(status_code=500, detail="Database connection pool unavailable")
    conn = None
    try:
        conn = db_pool.getconn()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM tasks WHERE id = %s;", (task_id,))
            conn.commit()
            
            if cache:
                cache.delete("dashboard:tasks")
        return {"status": "DELETED", "id": task_id}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn: db_pool.putconn(conn)