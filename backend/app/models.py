from sqlalchemy import Column, Integer, String, Float, DateTime
from .database import Base
from datetime import datetime, timezone

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    password_hash = Column(String, nullable=False)

class GoldAsset(Base):
    __tablename__ = 'gold_assets'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    classification = Column(String, nullable=False)  # 'jewelry' | 'gold_bar'
    subtype = Column(String, nullable=True)
    weight = Column(Float, nullable=False)
    purchase_price_per_gram = Column(Float, nullable=False)
    purchase_price = Column(Float, nullable=False)
    purchase_date = Column(String, nullable=False)
    photo = Column(String, nullable=True)
    notes = Column(String, nullable=True, default='')
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class GoldPrice(Base):
    __tablename__ = 'gold_prices'
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False, unique=True)
    price = Column(Float, nullable=False)
