export interface Sku {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  price: number;
  msrp: number;
  units: number;
  lastUpdated: string;
}

export function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n < 100 ? 2 : 0,
  }).format(n);
}

const DEFAULT_MARGIN = 0.40;
const MARGIN_FLOOR = 15;

export function computeSalePrice(cost: number, brand: string): number {
  const margin = MARGIN_OVERRIDES[brand] ?? DEFAULT_MARGIN;
  return Math.max(cost / (1 - margin), cost + MARGIN_FLOOR);
}

