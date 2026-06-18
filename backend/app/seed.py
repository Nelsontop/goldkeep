import random
import logging
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from .models import User, GoldPrice
from .config import PASSWORD_HASH, INITIAL_PASSWORD
from .fetch_gold import fetch_realtime_price

logger = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

def seed(db: Session):
    user = db.query(User).first()
    if user:
        return

    if PASSWORD_HASH:
        password_hash = PASSWORD_HASH
    else:
        password_hash = pwd_context.hash(INITIAL_PASSWORD)
    db.add(User(password_hash=password_hash))

    # Try to get real price, fall back to mock
    latest_price = fetch_realtime_price()
    if latest_price is None:
        latest_price = 520.0
        logger.warning('Using mock gold price data')

    # Generate 90-day history anchored to real latest price
    price = latest_price
    today = datetime.now(timezone.utc).date()
    points = []
    for i in range(90):
        d = today - timedelta(days=89 - i)
        # Work backward from latest: earlier days have variance
        if i == 89:
            price = latest_price
        else:
            price += (random.random() - 0.48) * 8
            price = max(price, latest_price * 0.7)
        points.append(GoldPrice(date=d.isoformat(), price=round(price, 2)))

    db.add_all(points)
    db.commit()
    logger.info(f'Seeded 90 days of gold prices (latest: ¥{latest_price}/g)')
