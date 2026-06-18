import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from .database import get_db
from .models import GoldAsset
from .config import UPLOAD_DIR
from .schemas import AssetCreate, AssetUpdate, AssetResponse

router = APIRouter(prefix='/api/assets', tags=['assets'])

def save_photo(photo: UploadFile) -> str:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(photo.filename)[1] or '.jpg'
    filename = f'{uuid.uuid4().hex}{ext}'
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, 'wb') as f:
        f.write(photo.file.read())
    return f'/uploads/{filename}'

@router.get('', response_model=list[AssetResponse])
def list_assets(classification: str | None = None, db: Session = Depends(get_db)):
    q = db.query(GoldAsset)
    if classification:
        q = q.filter(GoldAsset.classification == classification)
    return q.order_by(GoldAsset.created_at.desc()).all()

@router.post('/upload')
def upload_photo(photo: UploadFile = File(...)):
    return {'path': save_photo(photo)}

@router.get('/{asset_id}', response_model=AssetResponse)
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(GoldAsset).filter(GoldAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail='资产不存在')
    return asset

@router.post('', response_model=AssetResponse)
def create_asset(
    name: str = Form(...),
    classification: str = Form(...),
    subtype: str | None = Form(None),
    weight: float = Form(...),
    purchase_price_per_gram: float = Form(...),
    purchase_price: float = Form(...),
    purchase_date: str = Form(...),
    notes: str = Form(''),
    photo: UploadFile | None = File(None),
    photo_path: str | None = Form(None),
    db: Session = Depends(get_db),
):
    if photo_path:
        pass  # already uploaded
    elif photo and photo.filename:
        photo_path = save_photo(photo)

    asset = GoldAsset(
        name=name,
        classification=classification,
        subtype=subtype,
        weight=weight,
        purchase_price_per_gram=purchase_price_per_gram,
        purchase_price=purchase_price,
        purchase_date=purchase_date,
        photo=photo_path,
        notes=notes,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset

@router.put('/{asset_id}', response_model=AssetResponse)
def update_asset(
    asset_id: int,
    name: str = Form(None),
    classification: str = Form(None),
    subtype: str | None = Form(None),
    weight: float = Form(None),
    purchase_price_per_gram: float = Form(None),
    purchase_price: float = Form(None),
    purchase_date: str = Form(None),
    notes: str = Form(None),
    photo: UploadFile | None = File(None),
    photo_path: str | None = Form(None),
    db: Session = Depends(get_db),
):
    asset = db.query(GoldAsset).filter(GoldAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail='资产不存在')

    update_data = {
        k: v for k, v in {
            'name': name, 'classification': classification, 'subtype': subtype,
            'weight': weight, 'purchase_price_per_gram': purchase_price_per_gram,
            'purchase_price': purchase_price, 'purchase_date': purchase_date, 'notes': notes,
        }.items() if v is not None
    }
    for k, v in update_data.items():
        setattr(asset, k, v)

    if photo_path:
        asset.photo = photo_path
    elif photo and photo.filename:
        asset.photo = save_photo(photo)

    db.commit()
    db.refresh(asset)
    return asset

@router.delete('/{asset_id}')
def delete_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(GoldAsset).filter(GoldAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail='资产不存在')
    if asset.photo:
        filepath = os.path.join(os.path.dirname(UPLOAD_DIR), asset.photo.lstrip('/'))
        if os.path.exists(filepath):
            os.remove(filepath)
    db.delete(asset)
    db.commit()
    return {'message': '已删除'}
