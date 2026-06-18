from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .database import get_db
from .models import GoldPrice
from .schemas import GoldPriceResponse
from .fetch_gold import fetch_realtime_price

router = APIRouter(prefix='/api/gold-prices', tags=['gold_prices'])


def ensure_today(db: Session):
    today = datetime.now(timezone.utc).date().isoformat()
    if not db.query(GoldPrice).filter(GoldPrice.date == today).first():
        price = fetch_realtime_price()
        if price:
            db.add(GoldPrice(date=today, price=price))
            db.commit()


@router.get('', response_model=list[GoldPriceResponse])
def get_prices(db: Session = Depends(get_db)):
    ensure_today(db)
    return db.query(GoldPrice).order_by(GoldPrice.date.asc()).all()


@router.get('/latest')
def get_latest_price(db: Session = Depends(get_db)):
    ensure_today(db)
    latest = db.query(GoldPrice).order_by(GoldPrice.date.desc()).first()
    if not latest:
        return {'date': '', 'price': 0}
    return {'date': latest.date, 'price': latest.price}


@router.post('/refresh')
def refresh_price(db: Session = Depends(get_db)):
    price = fetch_realtime_price()
    if price is None:
        return {'ok': False, 'message': '获取金价失败'}
    today = datetime.now(timezone.utc).date().isoformat()
    existing = db.query(GoldPrice).filter(GoldPrice.date == today).first()
    if existing:
        existing.price = price
    else:
        db.add(GoldPrice(date=today, price=price))
    db.commit()
    return {'ok': True, 'price': price, 'date': today}
