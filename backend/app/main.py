from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app
from app.routes.api import router

app = FastAPI(title="SRE Watchdog Core Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the modular sub-routes layout
app.include_router(router)

# Mount the isolated Prometheus scraper application endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)