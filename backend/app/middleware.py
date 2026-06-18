from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from .auth import verify_token

PUBLIC_PATHS = {'/api/login', '/api/health', '/api/gold-prices', '/uploads'}

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if any(path.startswith(p) for p in PUBLIC_PATHS) or request.method == 'OPTIONS':
            return await call_next(request)

        # Allow frontend static assets without auth
        if not path.startswith('/api/'):
            return await call_next(request)

        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return JSONResponse(status_code=401, content={'detail': '未登录'})

        token = auth.split(' ', 1)[1]
        if not verify_token(token):
            return JSONResponse(status_code=401, content={'detail': '登录已过期'})

        return await call_next(request)
