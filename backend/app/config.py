import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_URL = os.getenv('DATABASE_URL', f"sqlite:///{os.path.join(BASE_DIR, 'goldkeep.db')}")
UPLOAD_DIR = os.getenv('UPLOAD_DIR', os.path.join(BASE_DIR, 'uploads'))
SECRET_KEY = os.getenv('SECRET_KEY', 'goldkeep-secret-change-in-production')
PASSWORD_HASH = os.getenv('PASSWORD_HASH', '')
INITIAL_PASSWORD = os.getenv('INITIAL_PASSWORD', 'lina')
ALGORITHM = 'HS256'
TOKEN_EXPIRE_HOURS = 72
