import httpx
import logging

logger = logging.getLogger(__name__)

GOLD_API = 'https://api.gold-api.com/price/XAU'
FOREX_API = 'https://open.er-api.com/v6/latest/USD'
OZ_TO_GRAM = 31.1035


def fetch_realtime_price() -> float | None:
    """Fetch current gold price in CNY/gram. Returns None on failure."""
    try:
        with httpx.Client(timeout=10) as client:
            gold_resp = client.get(GOLD_API)
            gold_resp.raise_for_status()
            gold_data = gold_resp.json()
            price_usd_per_oz = gold_data['price']

            forex_resp = client.get(FOREX_API)
            forex_resp.raise_for_status()
            forex_data = forex_resp.json()
            usd_cny = forex_data['rates']['CNY']

        price_cny_per_g = round(price_usd_per_oz / OZ_TO_GRAM * usd_cny, 2)
        logger.info(f'Fetched gold: ${price_usd_per_oz}/oz × ¥{usd_cny}/$ = ¥{price_cny_per_g}/g')
        return price_cny_per_g
    except Exception as e:
        logger.warning(f'Failed to fetch gold price: {e}')
        return None
