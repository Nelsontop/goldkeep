from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.middleware.base import BaseHTTPMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from .database import engine, Base, SessionLocal
from .middleware import AuthMiddleware
from .seed import seed
from .config import UPLOAD_DIR
from .auth import router as auth_router
from .assets import router as assets_router
from .gold_price import router as gold_price_router
from .fetch_gold import fetch_realtime_price
from .models import GoldPrice
import os
from datetime import datetime, timezone

MAX_UPLOAD = 20 * 1024 * 1024  # 20MB

class UploadSizeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.headers.get('content-length'):
            size = int(request.headers['content-length'])
            if size > MAX_UPLOAD:
                from fastapi.responses import JSONResponse
                return JSONResponse(status_code=413, content={'detail': '文件过大，请压缩后再上传'})
        return await call_next(request)

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'frontend', 'dist')

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    seed(db)
finally:
    db.close()

scheduler = BackgroundScheduler()

def daily_fetch():
    price = fetch_realtime_price()
    if price is None:
        return
    db = SessionLocal()
    try:
        today = datetime.now(timezone.utc).date().isoformat()
        existing = db.query(GoldPrice).filter(GoldPrice.date == today).first()
        if existing:
            existing.price = price
        else:
            db.add(GoldPrice(date=today, price=price))
        db.commit()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.add_job(daily_fetch, 'cron', hour=9, minute=30)
    scheduler.start()
    yield
    scheduler.shutdown()

app = FastAPI(title='攒金金', lifespan=lifespan)
app.add_middleware(UploadSizeMiddleware)
app.add_middleware(AuthMiddleware)

os.makedirs(UPLOAD_DIR, exist_ok=True)

app.include_router(auth_router)
app.include_router(assets_router)
app.include_router(gold_price_router)

@app.get('/api/health')
def health():
    return {'status': 'ok'}

# Serve built frontend
if os.path.isdir(FRONTEND_DIR):
    app.mount('/assets', StaticFiles(directory=os.path.join(FRONTEND_DIR, 'assets')), name='frontend_assets')
    app.mount('/uploads', StaticFiles(directory=UPLOAD_DIR), name='uploads')

    @app.get('/{full_path:path}')
    async def spa_fallback(request: Request, full_path: str):
        file_path = os.path.join(FRONTEND_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIR, 'index.html'))
else:
    app.mount('/uploads', StaticFiles(directory=UPLOAD_DIR), name='uploads')
