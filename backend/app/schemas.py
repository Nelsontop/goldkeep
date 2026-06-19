from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LoginRequest(BaseModel):
    password: str

class ChangePasswordRequest(BaseModel):
    new_password: str

class AssetCreate(BaseModel):
    name: str
    classification: str  # 'jewelry' | 'gold_bar'
    subtype: Optional[str] = None
    weight: float
    purchase_price_per_gram: float
    purchase_price: float
    purchase_date: str
    notes: str = ''
    location: str = '深圳市'

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    classification: Optional[str] = None
    subtype: Optional[str] = None
    weight: Optional[float] = None
    purchase_price_per_gram: Optional[float] = None
    purchase_price: Optional[float] = None
    purchase_date: Optional[str] = None
    notes: Optional[str] = None
    location: Optional[str] = None

class AssetResponse(BaseModel):
    id: int
    name: str
    classification: str
    subtype: Optional[str]
    weight: float
    purchase_price_per_gram: float
    purchase_price: float
    purchase_date: str
    photo: Optional[str]
    notes: str = ''
    location: str = '深圳市'
    created_at: datetime

    model_config = {'from_attributes': True}

class GoldPriceResponse(BaseModel):
    date: str
    price: float

    model_config = {'from_attributes': True}
