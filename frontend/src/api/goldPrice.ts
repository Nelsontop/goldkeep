import { apiGet } from './client'

export interface GoldPriceItem {
  date: string
  price: number
}

export async function fetchGoldPrices() {
  return apiGet<GoldPriceItem[]>('/gold-prices')
}

export async function fetchLatestPrice() {
  return apiGet<{ date: string; price: number }>('/gold-prices/latest')
}
