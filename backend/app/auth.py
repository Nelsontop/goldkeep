from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from jose import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone

from .database import get_db
from .models import User
from .config import SECRET_KEY, ALGORITHM, TOKEN_EXPIRE_HOURS

router = APIRouter(prefix='/api', tags=['auth'])
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

def create_token() -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode({'exp': expire}, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> bool:
    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return True
    except Exception:
        return False

@router.post('/login')
def login(password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user or not pwd_context.verify(password, user.password_hash):
        raise HTTPException(status_code=401, detail='密码错误')
    return {'token': create_token()}

@router.put('/password')
def change_password(new_password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail='用户不存在')
    if len(new_password) < 4:
        raise HTTPException(status_code=400, detail='密码至少4位')
    user.password_hash = pwd_context.hash(new_password)
    db.commit()
    return {'message': '密码修改成功'}
